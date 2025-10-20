'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Always check server session on mount - no localStorage
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.getCurrentUser();
      if (response.success && response.user) {
        setUser(response.user);
      } else {
        setUser(null);
      }
    } catch (error: unknown) {
      console.log('Auth check failed:', error instanceof Error ? error.message : "Unknown error");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData: User) => {
    // Only set user state - session is managed by server
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.logout();
      setUser(null);
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error: unknown) {
      toast.error(`Logout failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const refreshAuth = async () => {
    await checkAuth();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshAuth }}>
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
