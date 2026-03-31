import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/connect';
import { Transaction } from '@/lib/db/models/Transaction';
import { verifyToken } from '@/lib/utils/auth';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const token = req.headers.get('Authorization')?.split(' ')[1];
    const decoded = token ? verifyToken(token) : null;
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const transactions = await Transaction.find({ userId: decoded.userId }).sort({ createdAt: -1 }).limit(50);

    return NextResponse.json({
      success: true,
      transactions: transactions.map(tx => ({
        id: tx._id,
        type: tx.type,
        amount: tx.amount,
        description: tx.description,
        date: tx.createdAt.toISOString().split('T')[0]
      }))
    });

  } catch (error: any) {
    console.error('Transactions Fetch Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
