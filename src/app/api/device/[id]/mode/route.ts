export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();

    const token = req.headers.get('Authorization')?.split(' ')[1];
    const decoded = token ? verifyToken(token) : null;

    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const device = await Device.findOne({
      deviceId: id,
      userId: decoded.userId,
    });

    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    // 🔥 BACK TO AUTO MODE
    device.controlMode = 'AUTO';
    device.overrideExpiresAt = null;

    await device.save();

    return NextResponse.json({ success: true });

  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
