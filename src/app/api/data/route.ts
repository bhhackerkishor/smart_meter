import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/connect';
import { Device } from '@/lib/db/models/Device';
import { User } from '@/lib/db/models/User';
import { EnergyLog } from '@/lib/db/models/EnergyLog';
import { Transaction } from '@/lib/db/models/Transaction';
import { Settings, getBillingConfig } from '@/lib/db/models/Settings';
import { detectStatus, detectAlerts } from '@/lib/services/alertService';
import { calculateResidentialBill, calculateCommercialBill } from '@/lib/services/billingService';

/**
 * Data Ingestion Endpoint
 * POST /api/data
 * 
 * ESP32 sends: { deviceId, apiKey, voltage, current, power, energy, frequency, powerFactor }
 */
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const data = await req.json();

    const { deviceId, apiKey, voltage, current, power, energy, frequency, powerFactor } = data;

    // 1. Authenticate Device
    const device = await Device.findOne({ deviceId, apiKey });
    if (!device) {
      return NextResponse.json({ error: 'Device authentication failed' }, { status: 403 });
    }

    // 2. Fetch User for Balance Check
    const user = await User.findById(device.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 3. Calculation Logic & Configuration
    const billingConfig = await getBillingConfig();
    const kva = powerFactor > 0 ? (power / (powerFactor * 1000)) : 0;
    const status = detectStatus(voltage, current, power);
    const alerts = detectAlerts(voltage, frequency, powerFactor);

    // 4. Billing & Prepaid Logic
    const lastLog = await EnergyLog.findOne({ deviceId }).sort({ timestamp: -1 });
    const deltaUnits = lastLog ? Math.max(0, energy - lastLog.energy) : 0;
    
    let cost = 0;
    if (deltaUnits > 0) {
      if (device.mode === 'commercial') {
        const commBill = calculateCommercialBill(deltaUnits, kva, powerFactor, new Date(), billingConfig);
        cost = commBill.total;
      } else {
        const resBill = calculateResidentialBill(deltaUnits, billingConfig);
        cost = resBill.total;
      }

      // Deduct balance
      user.balance -= cost;
      await user.save();

      // Log Transaction if cost > 0
      if (cost > 0) {
        await Transaction.create({
          userId: user._id,
          deviceId: deviceId,
          type: 'deduction',
          amount: cost,
          description: `Energy consumption deduction: ${deltaUnits} units`
        });
      }
    }

    // 5. Prepaid Relay Control
    // 5. Advanced Relay Control Logic

let relayCommand = device.relayStatus;

// 🔴 PRIORITY 1: Safety
if (user.balance <= 0) {
  relayCommand = 'OFF';
  device.relayStatus = 'OFF';
  device.status = 'inactive';
}

// 🟡 PRIORITY 2: Manual Mode
else if (device.controlMode === 'MANUAL') {

  // Optional expiry check
  if (device.overrideExpiresAt && new Date() > device.overrideExpiresAt) {
    device.controlMode = 'AUTO'; // revert back
  } else {
    relayCommand = device.manualRelay;
    device.relayStatus = device.manualRelay;
    device.status = relayCommand === 'ON' ? 'online' : 'offline';
  }
}

// 🟢 PRIORITY 3: Auto Mode
if (device.controlMode === 'AUTO') {
  relayCommand = 'ON';
  device.relayStatus = 'ON';
  device.status = 'online';
}
    
    device.lastActive = new Date();
    await device.save();

    // 6. Save Energy Log
    const log = await EnergyLog.create({
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
      timestamp: new Date(),
    });

    // 7. Success Response
    return NextResponse.json({
      success: true,
      command: relayCommand, // ESP32 turns ON/OFF relay based on this
      balance: user.balance,
      status: status,
      alerts: alerts
    });

  } catch (error: any) {
    console.error('Data Ingestion Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
