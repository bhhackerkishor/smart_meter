import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';
import { Transaction } from '@/lib/db/models/Transaction';
import { verifyToken } from '@/lib/utils/auth';

/**
 * Get All Transactions with User Info
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 50;
    const type = searchParams.get('type');

    const query: any = {};
    if (type) query.type = type;

    const transactions = await Transaction.find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Get User Details for each transaction
    const txWithUser = await Promise.all(transactions.map(async (tx) => {
      const user = await User.findById(tx.userId).select('name email');
      return {
        ...tx.toObject(),
        user: user || { name: 'Deleted User', email: 'N/A' }
      };
    }));

    const total = await Transaction.countDocuments(query);

    return NextResponse.json({
      success: true,
      transactions: txWithUser,
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
