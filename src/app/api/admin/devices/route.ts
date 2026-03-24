import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';
import { Device } from '@/lib/db/models/Device';
import { verifyToken } from '@/lib/utils/auth';

/**
 * Get All Devices with User Info
 */
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

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;

    const query = {
      $or: [
        { deviceId: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ]
    };

    const devices = await Device.find(query)
      .sort({ lastActive: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Get User Names for each device
    const devicesWithUser = await Promise.all(devices.map(async (d) => {
      const user = await User.findById(d.userId).select('name email');
      return {
        ...d.toObject(),
        user: user || { name: 'Unassigned', email: 'N/A' }
      };
    }));

    const total = await Device.countDocuments(query);

    return NextResponse.json({
      success: true,
      devices: devicesWithUser,
      pagination: {
        page,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * Update Device (Assign/Relay/Delete)
 */
export async function PATCH(req: Request) {
  try {
    await connectToDatabase();
    const token = req.headers.get('Authorization')?.split(' ')[1];
    const decoded = token ? verifyToken(token) : null;
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const admin = await User.findById(decoded.userId);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { deviceId, updates } = await req.json();
    
    const device = await Device.findOneAndUpdate({ deviceId }, updates, { new: true });
    if (!device) return NextResponse.json({ error: 'Device not found' }, { status: 404 });

    return NextResponse.json({ success: true, device });

  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * Delete Device
 */
export async function DELETE(req: Request) {
  try {
    await connectToDatabase();
    const token = req.headers.get('Authorization')?.split(' ')[1];
    const decoded = token ? verifyToken(token) : null;
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const admin = await User.findById(decoded.userId);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { deviceId } = await req.json();
    
    const device = await Device.findOneAndDelete({ deviceId });
    if (!device) return NextResponse.json({ error: 'Device not found' }, { status: 404 });

    // Also remove from User's device list
    await User.findByIdAndUpdate(device.userId, {
      $pull: { devices: device.deviceId }
    });

    return NextResponse.json({ success: true, message: 'Device deleted' });

  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
