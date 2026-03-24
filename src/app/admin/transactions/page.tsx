'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  History, 
  Search, 
  Download, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Filter, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  User,
  CreditCard,
  Zap,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function TransactionMonitoring() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  
  const [transactions, setTransactions] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTransactions = async () => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/transactions?type=${type}&page=${page}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (user && token) fetchTransactions();
  }, [type, page, user, token]);

  if (loading || (fetching && page === 1)) return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
    </div>
  );

  return (
    <div className="p-10 space-y-12">
       <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2 underline decoration-blue-500/30">Financial <span className="text-blue-500">Audit</span></h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Real-time Ledger Monitoring and Revenue Reconciliation Protocols</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex glass p-1.5 gap-1 rounded-[20px]">
              {['', 'recharge', 'energy_deduction'].map((t) => (
                <button 
                  key={t}
                  onClick={() => { setType(t); setPage(1); }}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    type === t ? 'bg-blue-600 text-white glow-blue' : 'text-gray-500 hover:text-white'
                  }`}
                >
                  {t === '' ? 'Omni-Type' : t.replace('_', ' ')}
                </button>
              ))}
           </div>
           <button className="flex items-center gap-2 p-3.5 glass hover:bg-white/10 transition-colors rounded-xl border border-white/5 group bg-blue-600/5">
              <Download className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Export CSV Report</span>
           </button>
        </div>
      </header>

      {/* TRANSACTIONS TABLE */}
      <div className="glass overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 border-b border-white/5">
                     <th className="px-8 py-6">Ledger Reference</th>
                     <th className="px-8 py-6">Payer Identity</th>
                     <th className="px-8 py-6 text-center">Transaction Unit Type</th>
                     <th className="px-8 py-6 text-center">Allocation Date</th>
                     <th className="px-8 py-6 text-right">Value (₹)</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5 font-mono">
                  <AnimatePresence mode="popLayout">
                  {transactions.map((tx, i) => (
                    <motion.tr 
                      key={tx._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                       <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                             <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs uppercase ${
                               tx.type === 'recharge' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                             }`}>
                                {tx.type === 'recharge' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                             </div>
                             <div>
                                <p className="font-black text-sm tracking-tight uppercase text-white">{tx.type.replace('_', ' ')}</p>
                                <p className="text-gray-600 text-[10px] font-bold tracking-widest leading-none mt-1">REF-{tx._id.substring(18).toUpperCase()}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                             <User className="w-3.5 h-3.5 text-gray-500" />
                             <span className="font-black text-sm tracking-tighter text-gray-300">{tx.user?.name}</span>
                          </div>
                          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-0.5 block">{tx.user?.email}</span>
                       </td>
                       <td className="px-8 py-5 text-center">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                            tx.type === 'recharge' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                          }`}>
                             {tx.type === 'recharge' ? <CreditCard className="w-3 h-3" /> : <Zap className="w-3 h-3" />} {tx.description.split('-')[1]?.trim() || 'N/A'}
                          </div>
                       </td>
                       <td className="px-8 py-5 text-center">
                          <div className="flex items-center justify-center gap-2 text-gray-500">
                             <Calendar className="w-3 h-3" />
                             <span className="text-[10px] font-black uppercase tracking-widest">
                                {format(new Date(tx.timestamp), 'HH:mm:ss d/MM/yy')}
                             </span>
                          </div>
                       </td>
                       <td className="px-8 py-5 text-right">
                          <span className={`text-lg font-black tracking-tighter ${
                            tx.type === 'recharge' ? 'text-green-500' : 'text-red-500'
                          }`}>
                             {tx.type === 'recharge' ? '+' : '-'}₹{Math.abs(tx.amount).toFixed(2)}
                          </span>
                       </td>
                    </motion.tr>
                  ))}
                  </AnimatePresence>
               </tbody>
            </table>
         </div>

         {/* PAGINATION HUB */}
         <footer className="px-8 py-6 border-t border-white/5 bg-white/[0.02] flex justify-between items-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Reconciled {transactions.length} entry points in current ledger block</p>
            <div className="flex items-center gap-4">
               <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2.5 glass hover:bg-white/10 transition-colors rounded-lg border border-white/5 disabled:opacity-30 disabled:hover:bg-transparent"
               >
                  <ChevronLeft className="w-4 h-4 text-gray-400" />
               </button>
               <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 bg-blue-600/10 px-4 py-2 rounded-lg border border-blue-500/20">
                  Block {page} / {totalPages}
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
