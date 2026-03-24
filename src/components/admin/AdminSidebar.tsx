'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  Users, 
  Cpu, 
  Settings, 
  History, 
  AlertTriangle, 
  LayoutDashboard,
  LogOut,
  Zap
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Device Fleet', href: '/admin/devices', icon: Cpu },
    { name: 'Billing Control', href: '/admin/billing', icon: Settings },
    { name: 'Transactions', href: '/admin/transactions', icon: History },
    { name: 'System Alerts', href: '/admin/alerts', icon: AlertTriangle },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-black border-r border-white/5 flex flex-col z-50">
      <div className="p-8 border-b border-white/5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center glow-blue">
          <Zap className="text-white w-5 h-5 fill-current" />
        </div>
        <span className="font-black text-xl tracking-tighter">VOLTFLOW <span className="text-blue-500">ADMIN</span></span>
      </div>

      <nav className="flex-1 p-6 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          
          return (
            <Link 
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-bold text-sm",
                isActive 
                  ? "bg-blue-600/10 text-blue-500 border border-blue-500/20" 
                  : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 transition-transform duration-200 group-hover:scale-110",
                isActive ? "text-blue-500" : "text-gray-500 group-hover:text-blue-400"
              )} />
              {link.name}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 glow-blue animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/5">
        <button 
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-500 hover:bg-red-500/10 transition-colors font-bold text-sm"
        >
          <LogOut className="w-5 h-5" />
          Terminate Session
        </button>
      </div>
    </aside>
  );
}
