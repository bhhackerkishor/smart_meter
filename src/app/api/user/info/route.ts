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

    // For each device, get the latest log
    const devicesWithLogs = await Promise.all(
      devices.map(async (d) => {
        const lastLog = await EnergyLog.findOne({ deviceId: d.deviceId }).sort({ timestamp: -1 });
        return {
          ...d.toObject(),
          lastLog
        };
      })
    );

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        balance: user.balance
      },
      devices: devicesWithLogs
    });

  } catch (error: any) {
    console.error('User Info Fetch Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
