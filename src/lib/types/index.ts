export interface User {
  _id: string;
  name: string;
  email: string;
  balance: number;
  devices: string[];
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  createdAt: string;
}

export interface Device {
  _id: string;
  deviceId: string;
  name: string;
  mode: 'residential' | 'commercial';
  status: 'online' | 'offline';
  relayStatus: 'ON' | 'OFF';
  apiKey: string;
  userId: string;
  lastActive: string;
  lastLog?: EnergyLog;
}

export interface EnergyLog {
  _id: string;
  deviceId: string;
  voltage: number;
  current: number;
  power: number;
  energy: number;
  frequency: number;
  powerFactor: number;
  kva: number;
  status: string;
  alerts: string[];
  timestamp: string;
}

export interface Transaction {
  _id: string;
  userId: string;
  deviceId?: string;
  type: 'recharge' | 'energy_deduction';
  amount: number;
  description: string;
  timestamp: string;
}

export interface BillingConfig {
  residential: {
    slabs: Array<{ limit: number; rate: number }>;
    fixedCharge: number;
    taxRate: number;
  };
  commercial: {
    energyRate: number;
    demandRate: number;
    fixedCharge: number;
    pfPenaltyThreshold: number;
    pfPenaltyRate: number;
    todTiming: { start: number; end: number; multiplier: number };
  };
}
