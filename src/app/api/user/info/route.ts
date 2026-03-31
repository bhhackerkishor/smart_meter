import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';
import { Device } from '@/lib/db/models/Device';
import { EnergyLog } from '@/lib/db/models/EnergyLog';
import { verifyToken } from '@/lib/utils/auth';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const token = req.headers.get('Authorization')?.split(' ')[1];
    const decoded = token ? verifyToken(token) : null;
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const devices = await Device.find({ userId: decoded.userId });

    // For each device, get the latest log and daily consumption
    let dailyTotalConsumption = 0;
    let anyAlerts = false;

    const devicesWithLogs = await Promise.all(
      devices.map(async (d) => {
        const lastLog = await EnergyLog.findOne({ deviceId: d.deviceId }).sort({ timestamp: -1 });
        
        // Calculate daily consumption for this device
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        
        const [firstLogOfDay, lastLogOfDay] = await Promise.all([
          EnergyLog.findOne({ deviceId: d.deviceId, timestamp: { $gte: startOfDay } }).sort({ timestamp: 1 }),
          EnergyLog.findOne({ deviceId: d.deviceId, timestamp: { $gte: startOfDay } }).sort({ timestamp: -1 })
        ]);

        const deviceDailyConsumption = (lastLogOfDay && firstLogOfDay) 
          ? Math.max(0, lastLogOfDay.energy - firstLogOfDay.energy) 
          : 0;
        
        dailyTotalConsumption += deviceDailyConsumption;

        if (lastLog?.alerts && lastLog.alerts.length > 0) anyAlerts = true;

        // Check for real-time online/offline status (active in last 2 minutes)
        const isActuallyOnline = d.lastActive && (new Date().getTime() - new Date(d.lastActive).getTime() < 120000);

        return {
          ...d.toObject(),
          lastLog,
          dailyConsumption: deviceDailyConsumption,
          isOnline: isActuallyOnline
        };
      })
    );

    const projectedMonthly = (dailyTotalConsumption / (new Date().getHours() + 1)) * 24 * 30; // Rough projection

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        balance: user.balance,
        role: user.role,
        status: user.status
      },
      stats: {
        dailyConsumption: Number(dailyTotalConsumption.toFixed(2)),
        projectedMonthly: Number(projectedMonthly.toFixed(2)),
        anyAlerts: anyAlerts,
        powerQuality: anyAlerts ? 'UNSTABLE' : 'STABLE'
      },
      devices: devicesWithLogs
    });

  } catch (error: any) {
    console.error('User Info Fetch Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
