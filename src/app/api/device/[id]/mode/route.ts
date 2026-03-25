import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/connect';
import { Device } from '@/lib/db/models/Device';
import { verifyToken } from '@/lib/utils/auth';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const token = req.headers.get('Authorization')?.split(' ')[1];
    const decoded = token ? verifyToken(token) : null;

    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { controlMode } = await req.json(); // 'AUTO' | 'MANUAL'

    const device = await Device.findOne({
      deviceId: id,
      userId: decoded.userId
    });

    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    // 🔥 UPDATE MODE
    device.controlMode = controlMode;

    // Optional: reset manual override if AUTO
    if (controlMode === 'AUTO') {
      device.manualRelay = null;
      device.overrideExpiresAt = null;
    }

    await device.save();

    return NextResponse.json({
      success: true,
      controlMode: device.controlMode
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
