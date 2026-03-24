'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Zap, 
  Waves, 
  Activity, 
  Trash2, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  Loader2,
  Filter,
  RefreshCw,
  MoreVertical,
  ArrowUpRight
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function AlertMonitoring() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  
  const [alerts, setAlerts] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  // Mocking alerts for now as we don't have a separate Alert model yet,
  // we usually detect them on-the-fly or log them to EnergyLogs.
  // In a real system, we'd have an Alerts collection.
  const fetchAlerts = async () => {
    if (!token) return;
    setFetching(true);
    // Simulating real-time alert aggregation from system logs
    setTimeout(() => {
      setAlerts([
        { id: '1', level: 'CRITICAL', type: 'OVERLOAD', msg: 'UNIT-7x-ALPHA exceeding 5kW (Peak load 5.6kW)', node: 'UNIT-7x-ALPHA', time: new Date() },
        { id: '2', level: 'WARNING', type: 'VOLTAGE', msg: 'UNIT-2y-BETA reporting 251V (Potential grid surge)', node: 'UNIT-2y-BETA', time: new Date(Date.now() - 300000) },
        { id: '3', level: 'NORMAL', type: 'PF', msg: 'UNIT-3y-GAMMA PF recovered to 0.94', node: 'UNIT-3y-GAMMA', time: new Date(Date.now() - 1200000) },
        { id: '4', level: 'CRITICAL', type: 'OUTAGE', msg: 'UNIT-1x-DELTA offline (Manual disconnect or grid failure)', node: 'UNIT-1x-DELTA', time: new Date(Date.now() - 3600000) },
        { id: '5', level: 'WARNING', type: 'TAMPER', msg: 'Housing enclosure opened on UNIT-5y-EPSILON', node: 'UNIT-5y-EPSILON', time: new Date(Date.now() - 4200000) },
      ]);
      setFetching(false);
    }, 800);
  };

  useEffect(() => {
    if (user && token) fetchAlerts();
  }, [user, token]);

  if (loading || fetching) return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
    </div>
  );

  return (
    <div className="p-10 space-y-12">
       <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2 underline decoration-red-500/30">System <span className="text-red-500">Sentinel</span></h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Active Anomaly Detection and Infrastructure Health Surveillance</p>
        </div>
        <div className="flex items-center gap-4">
           <button 
             onClick={fetchAlerts}
             className="p-3.5 glass hover:bg-white/10 transition-colors rounded-xl border border-white/5 active:rotate-180 duration-500"
           >
              <RefreshCw className="w-4 h-4 text-gray-400" />
           </button>
           <button className="flex items-center gap-2 p-3.5 glass hover:bg-white/10 transition-colors rounded-xl border border-white/5 group bg-red-600/5">
              <Filter className="w-4 h-4 text-red-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Filter Critical Only</span>
           </button>
        </div>
      </header>

      {/* ALERT FEED */}
      <div className="grid grid-cols-1 gap-6">
         <AnimatePresence mode="popLayout">
         {alerts.map((alert, i) => (
           <motion.div 
             key={alert.id}
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 0.95 }}
             transition={{ delay: i * 0.1 }}
             className={`p-1 rounded-[32px] group relative ${
               alert.level === 'CRITICAL' ? 'bg-red-500/10' : 
               alert.level === 'WARNING' ? 'bg-yellow-500/10' : 'bg-green-500/10'
             }`}
           >
              <div className="bg-black/80 backdrop-blur-3xl rounded-[31px] p-8 border border-white/5 flex gap-8 items-center">
                 <div className={`p-4 rounded-2xl flex items-center justify-center shrink-0 ${
                    alert.level === 'CRITICAL' ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 
                    alert.level === 'WARNING' ? 'bg-yellow-500 text-black shadow-[0_0_20px_rgba(234,179,8,0.4)]' : 'bg-green-500 text-black shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                 }`}>
                    {alert.type === 'OVERLOAD' && <Zap className="w-6 h-6" />}
                    {alert.type === 'VOLTAGE' && <Waves className="w-6 h-6" />}
                    {alert.type === 'PF' && <Activity className="w-6 h-6" />}
                    {alert.type === 'OUTAGE' && <ShieldAlert className="w-6 h-6" />}
                    {alert.type === 'TAMPER' && <AlertTriangle className="w-6 h-6" />}
                 </div>

                 <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3">
                       <span className={`text-[10px] font-black uppercase tracking-widest ${
                          alert.level === 'CRITICAL' ? 'text-red-500' : 
                          alert.level === 'WARNING' ? 'text-yellow-500' : 'text-green-500'
                       }`}>
                          {alert.level} PROTOCOL [{alert.type}]
                       </span>
                       <span className="text-gray-700 font-bold text-[10px]">•</span>
                       <span className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">{format(alert.time, 'HH:mm:ss')}</span>
                    </div>
                    <h3 className="text-lg font-black tracking-tight text-white group-hover:text-red-400 transition-colors uppercase italic">{alert.msg}</h3>
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Target Node: <span className="text-blue-500">{alert.node}</span> • Grid Sector 4X</p>
                 </div>

                 <div className="flex items-center gap-3">
                    <button 
                      onClick={() => router.push(`/device/${alert.node}`)}
                      className="px-6 py-2.5 rounded-xl glass hover:bg-white/10 text-xs font-black uppercase tracking-widest flex items-center gap-2 group/btn"
                    >
                       Analyze <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                    </button>
                    <button className="p-2.5 text-gray-700 hover:text-white transition-colors">
                       <MoreVertical className="w-5 h-5" />
                    </button>
                 </div>
              </div>
           </motion.div>
         ))}
         </AnimatePresence>
      </div>

      <div className="flex justify-center items-center py-10 border-t border-white/5">
         <div className="text-center space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Sentinel Surveillance Cycle Complete</p>
            <p className="text-[8px] font-bold text-gray-700 uppercase tracking-tighter italic">End of Active Event Queue</p>
         </div>
      </div>
    </div>
  );
}
