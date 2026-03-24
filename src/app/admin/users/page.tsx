'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Search, 
  Plus, 
  MoreVertical, 
  Eye, 
  Ban, 
  CheckCircle2, 
  Wallet,
  ArrowUpDown,
  Filter,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserManagement() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  
  const [users, setUsers] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/users?search=${search}&page=${page}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const updateUser = async (userId: string, updates: any) => {
    if (!token) return;
    setUpdatingId(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ userId, updates })
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map(u => u._id === userId ? { ...u, ...updates } : u));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user && token) fetchUsers();
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
          <h1 className="text-4xl font-black tracking-tighter mb-2 underline decoration-blue-500/30">User <span className="text-blue-500">Registry</span></h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Subscriber Identity and Lifecycle Authorization Control</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text"
                placeholder="Search Identity Hub (Name / Email)..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-80 pl-11 pr-4 py-3 glass rounded-xl border border-white/5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-sm"
              />
           </div>
           <button className="flex items-center gap-2 p-3.5 glass hover:bg-white/10 transition-colors rounded-xl border border-white/5 group">
              <Filter className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
           </button>
        </div>
      </header>

      {/* USERS TABLE */}
      <div className="glass overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 border-b border-white/5">
                     <th className="px-8 py-6">Subscriber Identity</th>
                     <th className="px-8 py-6">Financial Balance</th>
                     <th className="px-8 py-6 text-center">Nodes Attached</th>
                     <th className="px-8 py-6">Account Status</th>
                     <th className="px-8 py-6 text-right">Administrative Protocol</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  <AnimatePresence mode="popLayout">
                  {users.map((u, i) => (
                    <motion.tr 
                      key={u._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                       <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 font-black text-xs uppercase">
                                {u.name.substring(0, 2)}
                             </div>
                             <div>
                                <p className="font-black text-sm tracking-tight">{u.name}</p>
                                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">{u.email}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                             <Wallet className="w-3.5 h-3.5 text-green-500/50" />
                             <span className="font-black text-sm tracking-tighter">₹{u.balance.toFixed(2)}</span>
                          </div>
                          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-0.5 block">Prepaid Credit</span>
                       </td>
                       <td className="px-8 py-5 text-center">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest">
                             <Smartphone className="w-3 h-3 text-blue-500" /> {u.devices?.length || 0}
                          </div>
                       </td>
                       <td className="px-8 py-5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            u.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                          }`}>
                             {u.status}
                          </span>
                       </td>
                       <td className="px-8 py-5 text-right">
                          <div className="flex justify-end gap-2">
                             <button className="p-2.5 glass hover:bg-white/10 transition-colors rounded-lg border border-white/5 group/btn" title="View Deep Insights">
                                <Eye className="w-4 h-4 text-gray-500 group-hover/btn:text-blue-500" />
                             </button>
                             <button 
                               onClick={() => updateUser(u._id, { status: u.status === 'active' ? 'suspended' : 'active' })}
                               disabled={updatingId === u._id}
                               className={`p-2.5 glass transition-colors rounded-lg border border-white/5 group/btn ${
                                 u.status === 'active' ? 'hover:bg-red-500/10' : 'hover:bg-green-500/10'
                               }`}
                               title={u.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                             >
                                {updatingId === u._id ? (
                                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                ) : u.status === 'active' ? (
                                  <Ban className="w-4 h-4 text-gray-500 group-hover/btn:text-red-500" />
                                ) : (
                                  <CheckCircle2 className="w-4 h-4 text-gray-500 group-hover/btn:text-green-500" />
                                )}
                             </button>
                             <button 
                               onClick={() => updateUser(u._id, { balance: u.balance + 500 })}
                               disabled={updatingId === u._id}
                               className="p-2.5 glass hover:bg-blue-600/10 transition-colors rounded-lg border border-white/5 group/btn" 
                               title="Grant Promo Credits (₹500)"
                             >
                                <ShieldCheck className="w-4 h-4 text-gray-500 group-hover/btn:text-blue-500" />
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
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Showing {users.length} identity nodes per allocation block</p>
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
