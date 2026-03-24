'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Cpu, 
  Zap, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight, 
  Loader2,
  RefreshCw,
  Globe
} from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function AdminOverview() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [fetching, setFetching] = useState(true);

  const fetchStats = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      } else if (data.error === 'Admin access required') {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user && token) fetchStats();
  }, [user, loading, token]);

  if (loading || fetching) return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
    </div>
  );

  const kpis = [
    { label: 'Total Base Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-500', trend: '+12%', up: true },
    { label: 'Fleet Capacity', value: stats?.totalDevices || 0, icon: Cpu, color: 'text-purple-500', trend: '+5%', up: true },
    { label: 'Real-time Cons. (Today)', value: stats?.totalEnergyToday || 0, unit: 'kWh', icon: Zap, color: 'text-yellow-500', trend: '-2%', up: false },
    { label: 'Aggregate Revenue', value: stats?.totalRevenue || 0, unit: '₹', icon: DollarSign, color: 'text-green-500', trend: '+18%', up: true }
  ];

  return (
    <div className="p-10 space-y-10">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2">Enterprise <span className="text-blue-500">Overview</span></h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Strategic Grid Operations Hub • Live Environment</p>
        </div>
        <button 
          onClick={fetchStats}
          className="p-3 glass hover:bg-white/10 transition-colors rounded-xl border border-white/5 active:scale-95"
        >
          <RefreshCw className="w-5 h-5 text-gray-400" />
        </button>
      </header>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-8 group relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <kpi.icon className="w-16 h-16" />
             </div>
             
             <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-lg bg-white/5 border border-white/5 ${kpi.color}`}>
                  <kpi.icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{kpi.label}</span>
             </div>

             <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-black">{kpi.value.toLocaleString()}</span>
                {kpi.unit && <span className="text-gray-600 font-black text-sm uppercase">{kpi.unit}</span>}
             </div>

             <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${kpi.up ? 'text-green-500' : 'text-red-500'}`}>
                {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {kpi.trend} from previous cycle
             </div>
          </motion.div>
        ))}
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 glass p-10">
            <div className="flex justify-between items-center mb-10">
               <div>
                  <h3 className="text-xl font-black flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-blue-500" /> Grid Load Dynamics
                  </h3>
                  <p className="text-xs font-bold text-gray-600 mt-1 uppercase tracking-widest">Aggregate energy throughput (kW) Across active nodes</p>
               </div>
               <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Live Load</span>
                  </div>
               </div>
            </div>
            <div className="h-[400px]">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { time: '00:00', load: 1200 },
                    { time: '04:00', load: 800 },
                    { time: '08:00', load: 2400 },
                    { time: '12:00', load: 3800 },
                    { time: '16:00', load: 4200 },
                    { time: '20:00', load: 3100 },
                    { time: '23:59', load: 1500 },
                  ]}>
                    <defs>
                      <linearGradient id="adminLoad" x1="0" y1="0" x2="0" y2="1">
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
                    <Area type="monotone" dataKey="load" stroke="#3b82f6" fillOpacity={1} fill="url(#adminLoad)" strokeWidth={3} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="glass p-10 flex flex-col">
            <h3 className="text-xl font-black flex items-center gap-3 mb-8">
              <Globe className="w-5 h-5 text-purple-500" /> Fleet Distribution
            </h3>
            
            <div className="flex-1 flex flex-col justify-center space-y-8">
               <div className="space-y-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-bold text-gray-400">Online Performance</span>
                    <span className="text-2xl font-black text-green-500">
                      {((stats?.onlineDevices / stats?.totalDevices) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(stats?.onlineDevices / stats?.totalDevices) * 100}%` }}
                      className="h-full bg-green-500 glow-green shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                    />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Operational</p>
                    <p className="text-xl font-black">{stats?.onlineDevices}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Grid Lag</p>
                    <p className="text-xl font-black text-red-500">{stats?.totalDevices - stats?.onlineDevices}</p>
                  </div>
               </div>

               <div className="pt-8 border-t border-white/5 space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Top Service Nodes</p>
                  <div className="space-y-3">
                     {[
                       { city: 'Chennai Hub', load: '1.2 MW', health: '98%' },
                       { city: 'Coimbatore South', load: '840 kW', health: '94%' },
                       { city: 'Madurai East', load: '620 kW', health: '89%' }
                     ].map((node, i) => (
                       <div key={i} className="flex justify-between items-center p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                          <span className="text-xs font-bold">{node.city}</span>
                          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{node.load}</span>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* LIVE EVENT FEED SKELETON */}
      <div className="glass overflow-hidden">
         <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
            <h3 className="text-xl font-black flex items-center gap-3 tracking-tighter uppercase">
              <Activity className="w-5 h-5 text-blue-500" /> Platform Event Stream
            </h3>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
               <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Listening to 0.0.0.0:3000</span>
            </div>
         </div>
         <div className="p-0">
            <div className="divide-y divide-white/5 font-mono text-xs">
               {[
                 { type: 'INGEST', msg: 'UNIT-7x-ALPHA reported 234.5V | 12.3A', time: 'Just now', color: 'text-blue-500' },
                 { type: 'BILLING', msg: 'User kishor@example.com debited ₹4.50 (Res Slab 3)', time: '2m ago', color: 'text-green-500' },
                 { type: 'ALERT', msg: 'OVERLOAD DETECTED: Node UNIT-3y-BETA (5.6kW)', time: '5m ago', color: 'text-orange-500' },
                 { type: 'AUTH', msg: 'New admin session initiated from 1.1.1.1', time: '12m ago', color: 'text-purple-500' },
                 { type: 'SYSTEM', msg: 'Daily revenue projection exceeded (+12%)', time: '1h ago', color: 'text-cyan-500' }
               ].map((log, i) => (
                 <div key={i} className="px-8 py-4 flex items-center gap-6 hover:bg-white/[0.02] transition-colors group">
                    <span className="text-gray-600 w-20 shrink-0 text-center">{log.time}</span>
                    <span className={`${log.color} font-black w-20 shrink-0`}>[{log.type}]</span>
                    <span className="text-gray-400 group-hover:text-white transition-colors">{log.msg}</span>
                    <ArrowUpRight className="ml-auto w-4 h-4 text-gray-700 opacity-0 group-hover:opacity-100 transition-all cursor-pointer" />
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
