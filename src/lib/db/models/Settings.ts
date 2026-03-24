import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // e.g., 'billing_config'
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  updatedAt: { type: Date, default: Date.now },
});

export const Settings = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);

// Helper to get billing config
export const getBillingConfig = async () => {
  const config = await Settings.findOne({ key: 'billing_config' });
  if (config) return config.value;
  
  // Default fallback matching current logic
  return {
    residential: {
      slabs: [
        { limit: 100, rate: 0 },
        { limit: 100, rate: 2.35 },
        { limit: 200, rate: 4.70 },
        { limit: 100, rate: 6.30 },
        { limit: 100, rate: 8.40 },
        { limit: 200, rate: 9.45 },
        { limit: 200, rate: 10.50 },
        { limit: Infinity, rate: 11.55 },
      ],
      fixedCharge: 30,
      taxRate: 0.05
    },
    commercial: {
      energyRate: 7.5,
      demandRate: 150,
      fixedCharge: 100,
      pfPenaltyThreshold: 0.9,
      pfPenaltyRate: 0.02,
      todTiming: { start: 18, end: 22, multiplier: 1.1 }
    }
  };
};
