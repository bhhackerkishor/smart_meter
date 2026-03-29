import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/connect';
import { Device } from '@/lib/db/models/Device';
import { User } from '@/lib/db/models/User';
import { EnergyLog } from '@/lib/db/models/EnergyLog';
import { Transaction } from '@/lib/db/models/Transaction';
import { getBillingConfig } from '@/lib/db/models/Settings';
import { detectStatus, detectAlerts } from '@/lib/services/alertService';
import { calculateResidentialBill, calculateCommercialBill } from '@/lib/services/billingService';

export async function POST(req: Request) {
  try {
    console.log('📥 Incoming request...');

    await connectToDatabase();
    console.log('✅ Database connected');

    const data = await req.json();
    console.log('📊 Received Data:', data);

    const {
      deviceId,
      apiKey,
      voltage = 0,
      current = 0,
      power = 0,
      energy = 0,
      frequency = 0,
      powerFactor = 0
    } = data;

    // 🔴 Validate Input
    if (!deviceId || !apiKey) {
      console.error('❌ Missing deviceId or apiKey');
      return NextResponse.json(
        { error: 'Missing deviceId or apiKey' },
        { status: 400 }
      );
    }

    // 1. Authenticate Device
    const device = await Device.findOne({ deviceId, apiKey });
    if (!device) {
      console.error('❌ Device authentication failed');
      return NextResponse.json(
        { error: 'Device authentication failed' },
        { status: 403 }
      );
    }
    console.log('✅ Device authenticated:', deviceId);

    // 2. Fetch User
    const user = await User.findById(device.userId);
    if (!user) {
      console.error('❌ User not found for device');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    console.log('✅ User fetched:', user._id);

    // 3. Config & Calculations
    const billingConfig = await getBillingConfig();
    console.log('⚙️ Billing config loaded');

    const kva =
      powerFactor > 0 ? power / (powerFactor * 1000) : 0;

    const status = detectStatus(voltage, current, power);
    const alerts = detectAlerts(voltage, frequency, powerFactor);

    console.log('📈 Calculated:', { kva, status, alerts });

    // 4. Energy Difference
    const lastLog = await EnergyLog.findOne({ deviceId }).sort({ timestamp: -1 });
    const prevUnits = lastLog ? lastLog.energy : 0;
    const deltaUnits = lastLog ? Math.max(0, energy - prevUnits) : 0;

    let cost = 0;

    if (deltaUnits > 0) {
      if (device.mode === 'commercial') {
        const commBill = calculateCommercialBill(
          deltaUnits,
          kva,
          powerFactor,
          new Date(),
          billingConfig
        );
        cost = commBill.total;
      } else {
        // ✅ FIXED RESIDENTIAL LOGIC
        const prevTotalBill = prevUnits
          ? calculateResidentialBill(prevUnits, billingConfig).total
          : 0;

        const currentTotalBill = calculateResidentialBill(energy, billingConfig).total;

        cost = currentTotalBill - prevTotalBill;
      }

      // Deduct balance
      user.balance -= cost;
      await user.save();

      if (cost > 0) {
        await Transaction.create({
          userId: user._id,
          deviceId: deviceId,
          type: 'deduction',
          amount: cost,
          description: Energy consumption deduction: ${deltaUnits} units
        });
      }
    }

    // 5. Relay Control Logic
    let relayCommand: 'ON' | 'OFF';

    if (user.balance <= 0) {
      relayCommand = 'OFF';
      device.relayStatus = 'OFF';
      device.status = 'offline';
      console.warn('⚠️ Balance low → Relay OFF');
    } else {
      relayCommand = 'ON';
      device.relayStatus = 'ON';
      device.status = 'online';
    }

    device.lastActive = new Date();
    await device.save();

    console.log('🔌 Relay command:', relayCommand);

    // 6. Save Energy Log
    await EnergyLog.create({
      deviceId,
      voltage,
      current,
      power,
      energy,
      frequency,
      powerFactor,
      kva,
      status,
      alerts,
      timestamp: new Date()
    });

    console.log('📚 Energy log saved');

    // 7. Response
    return NextResponse.json({
      success: true,
      command: relayCommand,
      balance: user.balance,
      status,
      alerts
    });

  } catch (error: any) {
    console.error('🔥 Data Ingestion Error:', error.message, error.stack);

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
