import mongoose from 'mongoose';

const DeviceSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true },
  apiKey: { type: String, required: true },

  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Device Status
  status: { type: String, enum: ['online', 'offline', 'inactive'], default: 'offline' },

  // Relay state (actual last known state)
  relayStatus: { type: String, enum: ['ON', 'OFF'], default: 'ON' },

  // Billing mode
  mode: { type: String, enum: ['residential', 'commercial'], default: 'residential' },

  // 🔥 NEW: Control System
  controlMode: {
    type: String,
    enum: ['AUTO', 'MANUAL'],
    default: 'AUTO',
  },

  manualRelay: {
    type: String,
    enum: ['ON', 'OFF'],
    default: 'ON',
  },

  // Optional: auto revert manual override
  overrideExpiresAt: {
    type: Date,
    default: null,
  },

  lastActive: { type: Date, default: Date.now },

}, { timestamps: true });

export const Device =
  mongoose.models.Device || mongoose.model('Device', DeviceSchema);
