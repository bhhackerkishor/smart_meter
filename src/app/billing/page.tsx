'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { Navbar } from '@/components/common/Navbar';
import { CreditCard, Wallet, ArrowDownRight, ArrowUpRight, History, Calendar, Download, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BillingPage() {
  const { user, token, loading, refreshUser } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!loading && !user) window.location.href = '/login';
    // Mocking transactions for now, in production fetch from /api/transactions
    setTransactions([
      { id: '1', type: 'recharge', amount: 500, description: 'Mobile Recharge', date: '2026-03-24' },
      { id: '2', type: 'deduction', amount: 45.20, description: 'Energy Consumption (UNIT-7x)', date: '2026-03-23' },
      { id: '3', type: 'recharge', amount: 1000, description: 'Bank Transfer', date: '2026-03-20' },
    ]);
  }, [user, loading]);

  const handleRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rechargeAmount || processing) return;
    setProcessing(true);
    try {
      const res = await fetch('/api/recharge', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount: Number(rechargeAmount) }),
      });
      const data = await res.json();
      if (data.success) {
        setRechargeAmount('');
        await refreshUser();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        <header className="mb-12">
          <h1 className="text-5xl font-extrabold tracking-tight mb-3">Billing & Credits</h1>
          <p className="text-gray-400 text-lg">Manage your smart grid wallet and historical usage.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Wallet Card */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass p-10 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-600/10 transition-colors" />
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                <div className="space-y-2">
                  <span className="text-gray-400 text-sm font-black uppercase tracking-[0.2em]">Current Balance</span>
                  <h2 className="text-7xl font-black">₹{user?.balance.toFixed(2)}</h2>
                  <div className="flex items-center gap-2 text-green-500 font-bold">
                    <TrendingUp className="w-4 h-4" /> Account Active & Funded
                  </div>
                </div>

                <form onSubmit={handleRecharge} className="w-full md:w-auto space-y-4">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                    <input 
                      type="number" 
                      placeholder="Enter amount"
                      value={rechargeAmount}
                      onChange={(e) => setRechargeAmount(e.target.value)}
                      className="w-full md:w-64 pl-8 pr-4 py-4 rounded-xl glass border-white/5 focus:border-blue-500 transition-all font-bold"
                    />
                  </div>
                  <button 
                    disabled={processing}
                    className="w-full bg-white text-black py-4 rounded-xl font-black transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-white/5 disabled:opacity-50"
                  >
                    <CreditCard className="w-5 h-5" /> {processing ? 'Processing...' : 'Quick Recharge'}
                  </button>
                </form>
              </div>
            </motion.div>

            {/* History Table */}
            <div className="glass overflow-hidden">
              <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-xl font-black flex items-center gap-3">
                  <History className="w-5 h-5 text-blue-500" /> Transaction History
                </h3>
                <button className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
                  <Download className="w-4 h-4" /> Export
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                      <th className="px-8 py-6">Transaction ID</th>
                      <th className="px-8 py-6">Description</th>
                      <th className="px-8 py-6">Date</th>
                      <th className="px-8 py-6 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm font-bold">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-8 py-6 text-gray-400 font-mono tracking-tighter">#{tx.id.padStart(6, '0')}</td>
                        <td className="px-8 py-6 text-white group-hover:text-blue-400 transition-colors">{tx.description}</td>
                        <td className="px-8 py-6 text-gray-500 flex items-center gap-2">
                           <Calendar className="w-4 h-4" /> {tx.date}
                        </td>
                        <td className={`px-8 py-6 text-right ${tx.type === 'recharge' ? 'text-green-500' : 'text-red-500'}`}>
                          <div className="flex items-center justify-end gap-1">
                            {tx.type === 'recharge' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                            ₹{tx.amount.toFixed(2)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Billing Insights Side Profile */}
          <div className="space-y-8">
             <div className="glass-card bg-blue-600 shadow-blue-500/20 border-none relative overflow-hidden">
               <div className="absolute -right-4 -bottom-4 opacity-20">
                 <Zap className="w-40 h-40 text-white fill-current" />
               </div>
               <div className="relative z-10 text-white">
                 <h4 className="text-xl font-black mb-2 uppercase tracking-tight">Active Plan</h4>
                 <p className="opacity-80 font-bold mb-8">Residential Edge Monitoring</p>
                 <div className="space-y-4">
                   <div className="flex justify-between text-sm opacity-80 font-bold">
                     <span>Current Cycle</span>
                     <span>Mar 1 - Mar 31</span>
                   </div>
                   <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                     <div className="h-full bg-white w-3/4" />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-60 text-right">75% through cycle</p>
                 </div>
               </div>
             </div>

             <div className="glass p-8">
               <h4 className="text-sm font-black uppercase tracking-[0.2em] text-gray-500 mb-6">Upcoming Costs</h4>
               <div className="space-y-6">
                 <div className="flex justify-between items-center group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="font-bold text-gray-300 group-hover:text-white transition-colors">Residential Slab Tax</span>
                    </div>
                    <span className="font-black text-gray-500">₹45.00</span>
                 </div>
                 <div className="flex justify-between items-center group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-gray-500" />
                      <span className="font-bold text-gray-300 group-hover:text-white transition-colors">Fixed Infrastructure</span>
                    </div>
                    <span className="font-black text-gray-500">₹30.00</span>
                 </div>
                 <div className="h-px w-full bg-white/5" />
                 <div className="flex justify-between items-center font-black">
                    <span className="uppercase tracking-widest text-xs text-gray-500">Projected Total</span>
                    <span className="text-xl text-blue-500">₹3,450.00</span>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
