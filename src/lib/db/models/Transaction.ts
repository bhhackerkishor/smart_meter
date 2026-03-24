import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deviceId: { type: String },
  type: { type: String, enum: ['recharge', 'deduction'], required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  timestamp: { type: Date, default: Date.now },
});

export const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
