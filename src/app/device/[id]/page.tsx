'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { Navbar } from '@/components/common/Navbar';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  Zap, 
  Activity, 
  AlertTriangle, 
  ArrowLeft, 
  Power, 
  Settings, 
  TrendingUp, 
  History, 
  AlertCircle, 
  Loader2,
  RefreshCw,
  Gauge,
  Waves,
  CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnalyzeDetails() {
  const { id } = useParams();
  const { user, token, loading } = useAuth();
  const router = useRouter();
  
  const [device, setDevice] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [relayLoading, setRelayLoading] = useState(false);
  const [controlMode, setControlMode] = useState<'AUTO' | 'MANUAL'>('AUTO');
  const fetchDetails = async () => {
    if (!token) return;
    try {
      const res = await fetch(`/api/device/${id}/details`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDevice(data.device);
        setLogs(data.logs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const toggleRelay = async () => {
  if (!token || relayLoading) return;

  setRelayLoading(true);

  const newStatus = device.relayStatus === 'ON' ? 'OFF' : 'ON';

  try {
    await fetch(`/api/device/${id}/details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    });

    fetchDetails(); // refresh state

  } catch (err) {
    console.error(err);
  } finally {
    setRelayLoading(false);
  }
};

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user && id) {
      fetchDetails();
      const interval = setInterval(fetchDetails, 5000);
      return () => clearInterval(interval);
    }
  }, [user, loading, id]);

  const chartData = useMemo(() => {
    return logs.map(log => ({
      time: format(new Date(log.timestamp), 'HH:mm:ss'),
      power: Number(log.power.toFixed(2)),
      voltage: Number(log.voltage.toFixed(2)),
      current: Number(log.current.toFixed(2)),
      pf: Number((log.powerFactor * 100).toFixed(1))
    }));
  }, [logs]);

  if (loading || fetching) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const currentLog = logs[logs.length - 1] || {};

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
                {/* Breadcrumbs & Header */}
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <button 
              onClick={() => router.push('/dashboard')}
              className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest mb-4"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to Fleet
            </button>
            <div className="flex items-center gap-4">
              <h1 className="text-5xl font-black tracking-tighter">Device <span className="text-blue-500">{id}</span></h1>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                device.status === 'online' ? 'bg-green-500 text-black' : 'bg-red-500 text-white'
              }`}>
                {device.status}
              </span>
            </div>
            <p className="text-gray-500 font-medium">Production Infrastructure • Managed Edge Monitoring Since {format(new Date(device.lastActive), 'MMM d, yyyy')}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="glass p-1.5 flex gap-1">
             

 <div className="glass p-4 rounded-xl space-y-4 min-w-[220px]">

  {/* MODE TOGGLE */}
  <div className="flex items-center justify-between gap-3">
    <span className="text-xs font-semibold text-gray-400">Mode</span>

    <button
      onClick={async () => {
        await fetch(`/api/device/${id}/mode`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchDetails();
      }}
      className={`w-14 h-7 flex items-center rounded-full p-1 transition ${
        device?.controlMode === 'AUTO' ? 'bg-green-600' : 'bg-gray-600'
      }`}
    >
      <div
        className={`bg-white w-5 h-5 rounded-full shadow-md transform transition ${
          device?.controlMode === 'AUTO' ? 'translate-x-7' : ''
        }`}
      />
    </button>

    <span className="text-xs font-bold">
      {device?.controlMode || '—'}
    </span>
  </div>

  {/* RELAY TOGGLE */}
  <div className="flex items-center justify-between gap-3">
    <span className="text-xs font-semibold text-gray-400">Relay</span>

    <button
      onClick={toggleRelay}
      disabled={device?.controlMode !== 'MANUAL' || relayLoading}
      className={`w-14 h-7 flex items-center rounded-full p-1 transition ${
        device?.relayStatus === 'ON' ? 'bg-blue-600' : 'bg-red-600'
      } ${
        device?.controlMode !== 'MANUAL'
          ? 'opacity-50 cursor-not-allowed'
          : ''
      }`}
    >
      <div
        className={`bg-white w-5 h-5 rounded-full shadow-md transform transition ${
          device?.relayStatus === 'ON' ? 'translate-x-7' : ''
        }`}
      />
    </button>

    <span className="text-xs font-bold">
      {device?.relayStatus || '—'}
    </span>
  </div>

  {/* WARNING */}
  {device?.controlMode === 'MANUAL' && (
    <p className="text-yellow-500 text-[10px]">
      Manual override active ⚠️
    </p>
  )}
</div>
              </div> 
               </div> 
            
        </header>

        {/* Real-time Metric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Real Power', value: currentLog.power || 0, unit: 'W', icon: Zap, color: 'text-blue-500' },
            { label: 'Voltage (RMS)', value: currentLog.voltage || 0, unit: 'V', icon: Waves, color: 'text-cyan-500' },
            { label: 'Current Load', value: currentLog.current || 0, unit: 'A', icon: Gauge, color: 'text-emerald-500' },
            { label: 'Power Factor', value: currentLog.powerFactor || 0, unit: 'ø', icon: Activity, color: 'text-orange-500' }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card"
            >
              <div className="flex justify-between items-start mb-4">
                <stat.icon className={`w-6 h-6 ${stat.color} p-1 bg-white/5 rounded-lg border border-white/5`} />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Live Metric</span>
              </div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1 mb-1">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-black">{stat.value.toFixed(stat.unit === 'A' ? 2 : 1)}</h3>
                <span className="text-gray-600 font-black text-xl">{stat.unit}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Big Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
           <div className="lg:col-span-2 glass p-8">
             <div className="flex justify-between items-center mb-10">
               <h3 className="text-xl font-black flex items-center gap-3">
                 <TrendingUp className="w-5 h-5 text-blue-500" /> Active Consumption Graph (Watts)
               </h3>
               <div className="flex gap-2 text-[10px] font-black uppercase tracking-widest">
                 <span className="text-blue-500 flex items-center gap-1">
                   <div className="w-2 h-2 rounded-full bg-blue-500" /> Real Power
                 </span>
               </div>
             </div>
             <div className="h-[400px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={chartData}>
                   <defs>
                     <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                   <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                   <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                   <Tooltip 
                     contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                     itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                   />
                   <Area type="monotone" dataKey="power" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPower)" strokeWidth={3} />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
           </div>

           <div className="glass p-8 space-y-8">
              <h3 className="text-xl font-black flex items-center gap-3">
                 <AlertCircle className="w-5 h-5 text-orange-500" /> Signal Quality Overview
              </h3>

              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Voltage Stability</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-green-500">Optimal</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-3 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${(currentLog.voltage / 260) * 100}%` }} />
                    </div>
                    <span className="text-sm font-black">{currentLog.voltage?.toFixed(0)}V</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Frequency Signal</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Locked</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-3 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${(currentLog.frequency / 55) * 100}%` }} />
                    </div>
                    <span className="text-sm font-black">{currentLog.frequency?.toFixed(2)}Hz</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/5 border-orange-500/20">
                  <div className="flex justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Efficiency Indicator</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${currentLog.powerFactor > 0.9 ? 'text-green-500' : 'text-orange-500'}`}>
                      {currentLog.powerFactor > 0.9 ? 'Excellent' : 'Requires Tuning'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-3 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full bg-orange-500" style={{ width: `${currentLog.powerFactor * 100}%` }} />
                    </div>
                    <span className="text-sm font-black">{currentLog.powerFactor?.toFixed(2)} PF</span>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-white/5">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-4">Active System Alerts</h4>
                 <div className="space-y-3">
                   {currentLog.alerts?.length > 0 ? currentLog.alerts.map((alert: string, i: number) => (
                     <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10 text-red-500 text-xs font-bold">
                       <AlertTriangle className="w-4 h-4 shrink-0" /> {alert}
                     </div>
                   )) : (
                     <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/10 text-green-500 text-xs font-bold">
                       <CheckCircle2 className="w-4 h-4 shrink-0" /> Zero critical grid alerts detected
                     </div>
                   )}
                 </div>
              </div>
           </div>
        </div>

        {/* Historical Logs List */}
        <div className="glass">
           <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-xl font-black flex items-center gap-3 uppercase tracking-tighter">
                <History className="w-5 h-5 text-blue-500" /> Edge Ingestion Stream
              </h3>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 animate-pulse">Live Logging Active</span>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                    <th className="px-8 py-6">UTC Timestamp</th>
                    <th className="px-8 py-6">Voltage (V)</th>
                    <th className="px-8 py-6">Current (A)</th>
                    <th className="px-8 py-6">Power (W)</th>
                    <th className="px-8 py-6">Energy (kWh)</th>
                    <th className="px-8 py-6">Diagnostic Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs font-bold font-mono tracking-tighter">
                  {logs.slice().reverse().slice(0, 15).map((log, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-5 text-gray-400">{format(new Date(log.timestamp), 'HH:mm:ss.SSS')}</td>
                      <td className="px-8 py-5 text-white">{log.voltage.toFixed(1)}V</td>
                      <td className="px-8 py-5 text-white">{log.current.toFixed(2)}A</td>
                      <td className="px-8 py-5 text-blue-400">{log.power.toFixed(1)}W</td>
                      <td className="px-8 py-5 text-gray-500">{log.energy.toFixed(6)}</td>
                      <td className="px-8 py-5">
                         <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-widest ${
                           log.status === 'Normal' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'
                         }`}>
                           {log.status}
                         </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
           </div>
        </div>
      </main>
    </div>
  );
}


