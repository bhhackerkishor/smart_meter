import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectToDatabase from '@/lib/db/connect';
import { Device } from '@/lib/db/models/Device';
import { verifyToken } from '@/lib/utils/auth';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const token = req.headers.get('Authorization')?.split(' ')[1];
    const decoded = token ? verifyToken(token) : null;
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { deviceId, mode } = await req.json();

    const existing = await Device.findOne({ deviceId });
    if (existing) {
      return NextResponse.json({ error: 'Device already registered' }, { status: 400 });
    }

    // Generate a secure API Key for the device
    const apiKey = crypto.randomBytes(32).toString('hex');

    const device = await Device.create({
      deviceId,
      apiKey,
      userId: decoded.userId,
      mode: mode || 'residential',
      status: 'offline',
      relayStatus: 'ON'
    });

    return NextResponse.json({
      success: true,
      apiKey, // MUST show this once for the user to configure ESP32
      device: { id: device._id, deviceId: device.deviceId, mode: device.mode, status: device.status }
    });

  } catch (error: any) {
    console.error('Device Registration Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
