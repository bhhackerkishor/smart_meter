'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { Navbar } from '@/components/common/Navbar';
import { RegisterDeviceModal } from '@/components/dashboard/RegisterDeviceModal';
import { Plus, Zap, Activity, AlertTriangle, Battery, CreditCard, ArrowUpRight, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { user, token, loading } = useAuth();
  const [devices, setDevices] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDevices = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/user/info', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDevices(data.devices);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/login';
    }
    if (user) {
      fetchDevices();
      const interval = setInterval(fetchDevices, 5000); // Polling for real-time feel
      return () => clearInterval(interval);
    }
  }, [user, loading]);

  if (loading || fetching) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      {token && (
        <RegisterDeviceModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          token={token} 
          onSuccess={fetchDevices} 
        />
      )}

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-extrabold tracking-tight mb-3">
              Good morning, <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">{user?.name}</span>
            </h1>
            <p className="text-gray-400 text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              All systems are monitoring normally across {devices.length} devices.
            </p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3.5 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 group shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
            Register Device
          </button>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                <Battery className="w-6 h-6 text-green-500" />
              </div>
              <span className="text-green-500 bg-green-500/10 px-2 py-1 rounded text-xs font-bold">+12% vs last month</span>
            </div>
            <div className="space-y-1">
              <span className="text-gray-400 text-sm font-medium">Available Credits</span>
              <h2 className="text-4xl font-black">₹{user?.balance.toFixed(2)}</h2>
            </div>
            <button className="w-full mt-6 py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm font-bold flex items-center justify-center gap-2 group">
              <CreditCard className="w-4 h-4 text-gray-400 group-hover:text-white" /> Quick Recharge
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <Zap className="w-6 h-6 text-blue-500" />
              </div>
              <span className="text-blue-500 bg-blue-500/10 px-2 py-1 rounded text-xs font-bold">Live Monitoring</span>
            </div>
            <div className="space-y-1">
              <span className="text-gray-400 text-sm font-medium">Daily Consumption</span>
              <h2 className="text-4xl font-black">12.4 <span className="text-xl text-gray-500">kWh</span></h2>
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm text-gray-400">
              <TrendingUp className="w-4 h-4 text-blue-400" /> Projection: ₹2,450 this month
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
              </div>
              <span className="text-orange-500 bg-orange-500/10 px-2 py-1 rounded text-xs font-bold">2 Active Alerts</span>
            </div>
            <div className="space-y-1">
              <span className="text-gray-400 text-sm font-medium">Power Quality</span>
              <h2 className="text-4xl font-black text-orange-500">STABLE</h2>
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm text-gray-400">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" /> Low Power Factor detected on Device #1
            </div>
          </motion.div>
        </div>

        {/* Devices List */}
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          Your Intelligent Devices
          <div className="h-px flex-1 bg-white/10" />
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {devices.map((device, idx) => (
            <motion.div
              key={device._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * idx }}
              className="glass p-8 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Zap className="w-24 h-24 text-blue-500" />
              </div>

              <div className="flex justify-between items-start mb-10 relative z-10">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-2xl font-black tracking-tight">{device.deviceId}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                      device.status === 'online' ? 'bg-green-500 text-black' : 'bg-red-500 text-white'
                    }`}>
                      {device.status}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm font-medium">Mode: {device.mode.toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Relay Status</p>
                  <span className={`text-lg font-black ${device.relayStatus === 'ON' ? 'text-blue-500' : 'text-red-500'}`}>
                    {device.relayStatus}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-10 relative z-10">
                <div>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Voltage</p>
                  <p className="text-xl font-bold">{device.lastLog?.voltage || 0}<span className="text-sm text-gray-500 ml-1 font-medium">V</span></p>
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Current</p>
                  <p className="text-xl font-bold">{device.lastLog?.current || 0}<span className="text-sm text-gray-500 ml-1 font-medium">A</span></p>
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Power</p>
                  <p className="text-xl font-bold">{device.lastLog?.power || 0}<span className="text-sm text-gray-500 ml-1 font-medium">W</span></p>
                </div>
              </div>

              <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5 group-hover:border-white/10 transition-colors relative z-10">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${device.lastLog?.status === 'Normal' ? 'bg-green-500' : 'bg-orange-500'} animate-pulse`} />
                  <span className="text-sm font-bold">{device.lastLog?.status || 'Active'}</span>
                </div>
                <button className="text-blue-400 hover:text-blue-300 text-sm font-black flex items-center gap-1 group/btn">
                  Analyze Details <ArrowUpRight className="w-4 h-4 transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
                </button>
              </div>
            </motion.div>
          ))}
          
          {devices.length === 0 && (
            <div className="col-span-full py-20 text-center glass border-dashed">
              <Zap className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400">No devices registered yet</h3>
              <p className="text-gray-600 mb-8">Start by adding your first Smart Meter device.</p>
              <button className="bg-white/10 hover:bg-white/15 px-6 py-2 rounded-lg text-sm font-bold border border-white/5">
                Setup Guide
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
