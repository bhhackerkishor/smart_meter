'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  balance: number;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
}

interface Stats {
  dailyConsumption: number;
  projectedMonthly: number;
  anyAlerts: boolean;
  powerQuality: 'STABLE' | 'UNSTABLE';
}

interface AuthState {
  user: User | null;
  stats: Stats | null;
  token: string | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    stats: null,
    token: null,
    loading: true
  });
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    setAuthState({
      token: savedToken,
      user: savedUser ? JSON.parse(savedUser) : null,
      stats: null,
      loading: false
    });
  }, []);

  const login = (newToken: string, newUser: User) => {
    setAuthState({
      token: newToken,
      user: newUser,
      stats: null,
      loading: false
    });
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    router.push('/dashboard');
  };

  const logout = () => {
    setAuthState({
      token: null,
      user: null,
      stats: null,
      loading: false
    });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const refreshUser = async () => {
    if (!authState.token) return;
    try {
      const res = await fetch('/api/user/info', {
        headers: { Authorization: `Bearer ${authState.token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAuthState(prev => ({
          ...prev,
          user: data.user,
          stats: data.stats
        }));
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    } catch (err) {
      console.error('Refresh user error', err);
    }
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
