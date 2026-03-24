import mongoose from 'mongoose';

const EnergyLogSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, index: true },
  voltage: { type: Number, required: true },
  current: { type: Number, required: true },
  power: { type: Number, required: true },
  energy: { type: Number, required: true },
  frequency: { type: Number, required: true },
  powerFactor: { type: Number, required: true },
  kva: { type: Number },
  status: { type: String },
  alerts: [{ type: String }],
  timestamp: { type: Date, default: Date.now },
});

// Compound index for efficiency
EnergyLogSchema.index({ deviceId: 1, timestamp: -1 });

export const EnergyLog = mongoose.models.EnergyLog || mongoose.model('EnergyLog', EnergyLogSchema);
