import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';
import { Device } from '@/lib/db/models/Device';
import { EnergyLog } from '@/lib/db/models/EnergyLog';
import { Transaction } from '@/lib/db/models/Transaction';
import { verifyToken } from '@/lib/utils/auth';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const token = req.headers.get('Authorization')?.split(' ')[1];
    const decoded = token ? verifyToken(token) : null;
    
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const admin = await User.findById(decoded.userId);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalDevices = await Device.countDocuments();
    const onlineDevices = await Device.countDocuments({ status: 'online' });
    
    // Calculate total energy consumption today (SUM energy for today's logs)
    const today = new Date();
    today.setHours(0,0,0,0);
    const logsToday = await EnergyLog.find({ timestamp: { $gte: today } });
    const totalEnergyToday = logsToday.reduce((acc, log) => acc + (log.power / 1000), 0); // Approx kWh over logged time points

    // Total Revenue (Sum of all energy deduction transactions)
    const revenueTx = await Transaction.find({ type: 'energy_deduction' });
    const totalRevenue = revenueTx.reduce((acc, tx) => acc + tx.amount, 0);

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalDevices,
        onlineDevices,
        totalEnergyToday: Number(totalEnergyToday.toFixed(2)),
        totalRevenue: Math.abs(Number(totalRevenue.toFixed(2)))
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
