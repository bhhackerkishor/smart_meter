import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/connect';
import { Device } from '@/lib/db/models/Device';
import { EnergyLog } from '@/lib/db/models/EnergyLog';
import { verifyToken } from '@/lib/utils/auth';

/**
 * Get Device Details and Logs
 * GET /api/device/[id]/details
 */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const token = req.headers.get('Authorization')?.split(' ')[1];
    const decoded = token ? verifyToken(token) : null;
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // 1. Get Device Details
    const device = await Device.findOne({ deviceId: id, userId: decoded.userId });
    if (!device) return NextResponse.json({ error: 'Device not found' }, { status: 404 });

    // 2. Get Recent Logs (Last 100 for charts)
    const logs = await EnergyLog.find({ deviceId: id })
      .sort({ timestamp: -1 })
      .limit(100);

    // 3. Current Stats (Latest Log)
    const current = logs[0] || null;

    return NextResponse.json({
      success: true,
      device,
      current,
      logs: logs.reverse(), // Reverse for chronological order in charts
    });

  } catch (error: any) {
    console.error('Device Details Fetch Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * Toggle Device Relay Manual Overridde
 * POST /api/device/[id]/relay
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const token = req.headers.get('Authorization')?.split(' ')[1];
    const decoded = token ? verifyToken(token) : null;
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { status } = await req.json(); // 'ON' or 'OFF'

    const device = await Device.findOneAndUpdate(
      { deviceId: id, userId: decoded.userId },
      { relayStatus: status },
      { new: true }
    );

    if (!device) return NextResponse.json({ error: 'Device not found' }, { status: 404 });

    return NextResponse.json({ success: true, relayStatus: device.relayStatus });

  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
