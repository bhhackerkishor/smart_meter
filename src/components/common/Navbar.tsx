'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { Zap, LogOut, LayoutDashboard, Wallet, User as UserIcon } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center glow-blue transition-transform group-hover:scale-110">
            <Zap className="text-white w-6 h-6 fill-current" />
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            VoltFlow
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <Link href="/dashboard" className="hover:text-white transition-colors flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
          <Link href="/billing" className="hover:text-white transition-colors flex items-center gap-2">
            <Wallet className="w-4 h-4" /> Billing
          </Link>
          <div className="h-6 w-px bg-white/10" />
          <div className="flex items-center gap-3 bg-white/5 pl-2 pr-4 py-1.5 rounded-full border border-white/5 hover:border-white/10 transition-colors">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
              <UserIcon className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-white text-xs font-bold leading-tight">{user.name}</span>
              <span className="text-blue-400 text-[10px] leading-tight font-bold">₹{user.balance.toFixed(2)}</span>
            </div>
          </div>
          <button 
            onClick={logout}
            className="hover:text-red-400 transition-all flex items-center gap-2 hover:translate-x-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
