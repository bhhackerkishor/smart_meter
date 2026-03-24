'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Settings, 
  Save, 
  Zap, 
  DollarSign, 
  Clock, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Loader2,
  CheckCircle2,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BillingControl() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  
  const [config, setConfig] = useState<any>(null);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const fetchConfig = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    if (!token || saving) return;
    setSaving(true);
    setMsg({ text: '', type: '' });
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ config })
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ text: 'Global configuration synchronized successfully!', type: 'success' });
        setTimeout(() => setMsg({ text: '', type: '' }), 3000);
      }
    } catch (err) {
      setMsg({ text: 'Synchronization failed. Check network link.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (user && token) fetchConfig();
  }, [user, token]);

  if (loading || fetching) return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
    </div>
  );

  return (
    <div className="p-10 space-y-12 max-w-6xl">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2 underline decoration-blue-500/30">Billing <span className="text-blue-500">Orchestrator</span></h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Macro-economic Grid Tariff and Revenue Model Configuration</p>
        </div>
        <div className="flex gap-4">
           {msg.text && (
             <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border ${
                msg.type === 'success' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
              }`}
             >
                {msg.text}
             </motion.div>
           )}
           <button 
             onClick={handleSave}
             disabled={saving}
             className="bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-3 rounded-xl transition-all active:scale-95 flex items-center gap-2 group shadow-lg shadow-blue-600/20 disabled:opacity-50"
           >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              SYNC GRID PRICING
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         {/* RESIDENTIAL CONFIG */}
         <div className="glass p-10 space-y-8">
            <h3 className="text-xl font-black flex items-center gap-3 tracking-tight">
               <Zap className="w-5 h-5 text-yellow-500" /> RESIDENTIAL SLAB LOGIC
            </h3>
            
            <div className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Fixed Maint. Charge (₹)</label>
                     <input 
                       type="number"
                       value={config.residential.fixedCharge}
                       onChange={(e) => setConfig({ ...config, residential: { ...config.residential, fixedCharge: Number(e.target.value) }})}
                       className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-bold focus:border-blue-500 outline-none"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Operational Tax (%)</label>
                     <input 
                       type="number"
                       value={config.residential.taxRate * 100}
                       onChange={(e) => setConfig({ ...config, residential: { ...config.residential, taxRate: Number(e.target.value) / 100 }})}
                       className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-bold focus:border-blue-500 outline-none"
                     />
                  </div>
               </div>

               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block">Energy Consumption Slabs (₹/kWh)</label>
                  <div className="space-y-3">
                     {config.residential.slabs.map((slab: any, i: number) => (
                       <div key={i} className="flex gap-3 items-center group">
                          <input 
                            type="number"
                            placeholder="Limit"
                            value={slab.limit === Infinity ? '' : slab.limit}
                            onChange={(e) => {
                               const newSlabs = [...config.residential.slabs];
                               newSlabs[i].limit = e.target.value === '' ? Infinity : Number(e.target.value);
                               setConfig({ ...config, residential: { ...config.residential, slabs: newSlabs }});
                            }}
                            className="bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs font-bold w-full focus:border-blue-500 outline-none"
                          />
                          <input 
                            type="number"
                            placeholder="Rate"
                            value={slab.rate}
                            onChange={(e) => {
                               const newSlabs = [...config.residential.slabs];
                               newSlabs[i].rate = Number(e.target.value);
                               setConfig({ ...config, residential: { ...config.residential, slabs: newSlabs }});
                            }}
                            className="bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs font-bold w-full focus:border-blue-500 outline-none"
                          />
                          <button 
                            className="p-2.5 text-red-500/50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                               const newSlabs = config.residential.slabs.filter((_: any, idx: number) => idx !== i);
                               setConfig({ ...config, residential: { ...config.residential, slabs: newSlabs }});
                            }}
                          >
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                     ))}
                     <button 
                       onClick={() => {
                          const newSlabs = [...config.residential.slabs, { limit: 100, rate: 10 }];
                          setConfig({ ...config, residential: { ...config.residential, slabs: newSlabs }});
                       }}
                       className="w-full py-3 border border-dashed border-white/10 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:border-blue-500/50 hover:text-blue-500 transition-all"
                     >
                        <Plus className="w-3 h-3" /> Append New Slab Segment
                     </button>
                  </div>
               </div>
            </div>
         </div>

         {/* COMMERCIAL CONFIG */}
         <div className="glass p-10 space-y-8">
            <h3 className="text-xl font-black flex items-center gap-3 tracking-tight">
               <DollarSign className="w-5 h-5 text-green-500" /> COMMERCIAL FLOW DYNAMICS
            </h3>

            <div className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Base Energy Rate (₹/kWh)</label>
                     <input 
                       type="number"
                       value={config.commercial.energyRate}
                       onChange={(e) => setConfig({ ...config, commercial: { ...config.commercial, energyRate: Number(e.target.value) }})}
                       className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-bold focus:border-blue-500 outline-none"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Demand Rate (₹/kVA)</label>
                     <input 
                       type="number"
                       value={config.commercial.demandRate}
                       onChange={(e) => setConfig({ ...config, commercial: { ...config.commercial, demandRate: Number(e.target.value) }})}
                       className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-bold focus:border-blue-500 outline-none"
                     />
                  </div>
               </div>

               <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                     <Clock className="w-4 h-4 text-blue-500" />
                     <h4 className="text-xs font-black uppercase tracking-widest">TOD (Time of Day) Peak Window</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                     <div className="space-y-2">
                        <label className="text-[8px] font-black uppercase tracking-widest text-gray-600">Start (Hr 0-23)</label>
                        <input 
                          type="number"
                          value={config.commercial.todTiming.start}
                          onChange={(e) => setConfig({ ...config, commercial: { ...config.commercial, todTiming: { ...config.commercial.todTiming, start: Number(e.target.value)}}})}
                          className="w-full bg-black/40 border border-white/5 rounded-lg p-2.5 text-xs font-bold focus:border-blue-500"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[8px] font-black uppercase tracking-widest text-gray-600">End (Hr 1-24)</label>
                        <input 
                          type="number"
                          value={config.commercial.todTiming.end}
                          onChange={(e) => setConfig({ ...config, commercial: { ...config.commercial, todTiming: { ...config.commercial.todTiming, end: Number(e.target.value)}}})}
                          className="w-full bg-black/40 border border-white/5 rounded-lg p-2.5 text-xs font-bold focus:border-blue-500"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[8px] font-black uppercase tracking-widest text-gray-600">Multiplier (x.x)</label>
                        <input 
                          type="number"
                          step="0.1"
                          value={config.commercial.todTiming.multiplier}
                          onChange={(e) => setConfig({ ...config, commercial: { ...config.commercial, todTiming: { ...config.commercial.todTiming, multiplier: Number(e.target.value)}}})}
                          className="w-full bg-black/40 border border-white/5 rounded-lg p-2.5 text-xs font-bold focus:border-blue-500"
                        />
                     </div>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex items-center gap-3">
                     <ShieldAlert className="w-4 h-4 text-orange-500" />
                     <h4 className="text-xs font-black uppercase tracking-widest">Power Quality Enforcement</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[8px] font-black uppercase tracking-widest text-gray-600">PF Threshold (x.xx)</label>
                        <input 
                          type="number"
                          step="0.01"
                          value={config.commercial.pfPenaltyThreshold}
                          onChange={(e) => setConfig({ ...config, commercial: { ...config.commercial, pfPenaltyThreshold: Number(e.target.value) }})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-bold focus:border-blue-500"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[8px] font-black uppercase tracking-widest text-gray-600">Penalty Rate (%)</label>
                        <input 
                          type="number"
                          value={config.commercial.pfPenaltyRate * 100}
                          onChange={(e) => setConfig({ ...config, commercial: { ...config.commercial, pfPenaltyRate: Number(e.target.value)/100 }})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-bold focus:border-blue-500"
                        />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div className="bg-blue-600/5 border border-blue-500/10 p-8 rounded-[32px] flex items-center gap-6">
         <div className="p-4 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500">
            <Info className="w-8 h-8" />
         </div>
         <div>
            <h4 className="font-black text-blue-500 uppercase tracking-widest text-xs mb-1">Grid Impact Warning</h4>
            <p className="text-gray-400 text-xs font-bold max-w-2xl leading-relaxed">
               Modifying global tariff configurations will affect energy deduction cycles for every active node in real-time. Ensure secondary verification of slab limits before synchronization.
            </p>
         </div>
      </div>
    </div>
  );
}
