'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Cpu, 
  Search, 
  Power, 
  Trash2, 
  User, 
  Activity, 
  RefreshCw, 
  Link as LinkIcon, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Radio,
  Clock,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function DeviceFleet() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  
  const [devices, setDevices] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchDevices = async () => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/devices?search=${search}&page=${page}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDevices(data.devices);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const updateDevice = async (deviceId: string, updates: any) => {
    if (!token) return;
    setActionLoading(deviceId);
    try {
      const res = await fetch('/api/admin/devices', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ deviceId, updates })
      });
      const data = await res.json();
      if (data.success) {
        setDevices(devices.map(d => d.deviceId === deviceId ? { ...d, ...updates } : d));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteDevice = async (deviceId: string) => {
    if (!token || !confirm(`Archive device ${deviceId}? This action is permanent.`)) return;
    setActionLoading(deviceId);
    try {
      const res = await fetch('/api/admin/devices', {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ deviceId })
      });
      const data = await res.json();
      if (data.success) {
        setDevices(devices.filter(d => d.deviceId !== deviceId));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user && token) fetchDevices();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, page, user, token]);

  if (loading || (fetching && page === 1)) return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
    </div>
  );

  return (
    <div className="p-10 space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2 underline decoration-blue-500/30">Node <span className="text-blue-500">Fleet</span></h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Cloud Orchestration and Hardware Asset Lifecycle Management</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text"
                placeholder="Locate Hardware (ID / Name)..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-80 pl-11 pr-4 py-3 glass rounded-xl border border-white/5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-sm"
              />
           </div>
           <button className="flex items-center gap-2 p-3.5 glass hover:bg-white/10 transition-colors rounded-xl border border-white/5 group">
              <Radio className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
           </button>
        </div>
      </header>

      {/* DEVICES TABLE */}
      <div className="glass overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 border-b border-white/5">
                     <th className="px-8 py-6">Hardware Identifier</th>
                     <th className="px-8 py-6">Owner Identity</th>
                     <th className="px-8 py-6 text-center">Cloud Pulse</th>
                     <th className="px-8 py-6">Operational Status</th>
                     <th className="px-8 py-6 text-right">Edge Control Protocol</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  <AnimatePresence mode="popLayout">
                  {devices.map((d, i) => (
                    <motion.tr 
                      key={d.deviceId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                       <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 font-black text-xs uppercase">
                                <Cpu className="w-5 h-5" />
                             </div>
                             <div>
                                <p className="font-black text-sm tracking-tight">{d.name}</p>
                                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest leading-none mt-1">{d.deviceId}</p>
                                <p className="text-[8px] text-blue-500/50 uppercase font-black tracking-tightest mt-1">API Key: {d.apiKey.substring(0, 10)}•••</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                             <User className="w-3.5 h-3.5 text-gray-500" />
                             <span className="font-black text-sm tracking-tighter">{d.user?.name}</span>
                          </div>
                          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-0.5 block">{d.user?.email}</span>
                       </td>
                       <td className="px-8 py-5 text-center">
                          <div className="inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 gap-2 items-center">
                             <div className={`w-1.5 h-1.5 rounded-full ${d.status === 'online' ? 'bg-green-500 shadow-[0_0_5px_green]' : 'bg-gray-700'} animate-pulse`} />
                             {d.status}
                          </div>
                       </td>
                       <td className="px-8 py-5">
                          <div className="flex items-center gap-2 text-gray-400">
                             <Clock className="w-3 h-3" />
                             <span className="text-[10px] font-black uppercase tracking-widest">
                                {d.lastActive ? format(new Date(d.lastActive), 'HH:mm:ss d/MM') : 'NEVER'}
                             </span>
                          </div>
                          <span className="text-[8px] font-bold text-gray-600 uppercase tracking-tighter mt-1 block">Edge Sync Point</span>
                       </td>
                       <td className="px-8 py-5 text-right">
                          <div className="flex justify-end gap-2">
                             <button 
                               onClick={() => router.push(`/device/${d.deviceId}`)}
                               className="p-2.5 glass hover:bg-white/10 transition-colors rounded-lg border border-white/5 group/btn" 
                               title="Deep Signal Analysis"
                             >
                                <Activity className="w-4 h-4 text-gray-500 group-hover/btn:text-blue-500" />
                             </button>
                             <button 
                               onClick={() => updateDevice(d.deviceId, { relayStatus: d.relayStatus === 'ON' ? 'OFF' : 'ON' })}
                               disabled={actionLoading === d.deviceId}
                               className={`p-2.5 glass transition-colors rounded-lg border border-white/5 group/btn ${
                                 d.relayStatus === 'ON' ? 'hover:bg-blue-600/10' : 'hover:bg-white/10'
                               }`}
                               title={`Manual Relay ${d.relayStatus === 'ON' ? 'Downtime' : 'Uptime'}`}
                             >
                                {actionLoading === d.deviceId ? (
                                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                ) : (
                                  <Power className={`w-4 h-4 ${d.relayStatus === 'ON' ? 'text-blue-500' : 'text-gray-500 group-hover/btn:text-blue-400'}`} />
                                )}
                             </button>
                             <button 
                               onClick={() => deleteDevice(d.deviceId)}
                               disabled={actionLoading === d.deviceId}
                               className="p-2.5 glass hover:bg-red-500/10 transition-colors rounded-lg border border-white/5 group/btn" 
                               title="Archive Asset"
                             >
                                <Trash2 className="w-4 h-4 text-gray-500 group-hover/btn:text-red-500" />
                             </button>
                          </div>
                       </td>
                    </motion.tr>
                  ))}
                  </AnimatePresence>
               </tbody>
            </table>
         </div>

         {/* PAGINATION HUB */}
         <footer className="px-8 py-6 border-t border-white/5 bg-white/[0.02] flex justify-between items-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Managing {devices.length} hardware nodes in local sector</p>
            <div className="flex items-center gap-4">
               <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2.5 glass hover:bg-white/10 transition-colors rounded-lg border border-white/5 disabled:opacity-30 disabled:hover:bg-transparent"
               >
                  <ChevronLeft className="w-4 h-4 text-gray-400" />
               </button>
               <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 bg-blue-600/10 px-4 py-2 rounded-lg border border-blue-500/20">
                  Sector {page} / {totalPages}
               </span>
               <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2.5 glass hover:bg-white/10 transition-colors rounded-lg border border-white/5 disabled:opacity-30 disabled:hover:bg-transparent"
               >
                  <ChevronRight className="w-4 h-4 text-gray-400" />
               </button>
            </div>
         </footer>
      </div>
    </div>
  );
}
