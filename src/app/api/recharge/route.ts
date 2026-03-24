import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';
import { Transaction } from '@/lib/db/models/Transaction';
import { verifyToken } from '@/lib/utils/auth';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const token = req.headers.get('Authorization')?.split(' ')[1];
    const decoded = token ? verifyToken(token) : null;
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount } = await req.json();
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const user = await User.findById(decoded.userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    user.balance += amount;
    await user.save();

    await Transaction.create({
      userId: user._id,
      type: 'recharge',
      amount,
      description: `Mobile recharge: ₹${amount}`
    });

    return NextResponse.json({ success: true, balance: user.balance });

  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
