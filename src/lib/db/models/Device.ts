import mongoose from 'mongoose';

const DeviceSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true },
  apiKey: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['online', 'offline'], default: 'offline' },
  relayStatus: { type: String, enum: ['ON', 'OFF'], default: 'ON' },
  mode: { type: String, enum: ['residential', 'commercial'], default: 'residential' },
  lastActive: { type: Date, default: Date.now },
});

export const Device = mongoose.models.Device || mongoose.model('Device', DeviceSchema);
