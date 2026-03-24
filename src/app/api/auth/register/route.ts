import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';
import { signToken } from '@/lib/utils/auth';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { name, email, password } = await req.json();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      balance: 1000, // Initial Promotional balance
    });

    const token = signToken({ userId: user._id.toString(), email: user.email });

    return NextResponse.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, balance: user.balance }
    });

  } catch (error: any) {
    console.log(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
