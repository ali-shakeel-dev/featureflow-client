'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi, setAuthToken, clearAuthToken, getAuthToken } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  admin: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken();
      if (token) {
        const response = await authApi.getCurrentUser();
        if (response.data) {
          setUser(response.data);
        } else {
          clearAuthToken();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const response = await authApi.login(email, password);
      if (response.data) {
        setAuthToken(response.data.token);
        setUser(response.data.user);
      } else {
        throw new Error(response.errors?.[0] || 'Login failed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setError(null);
    setLoading(true);
    try {
      const response = await authApi.signup(email, password, name);
      if (response.data) {
        setAuthToken(response.data.token);
        setUser(response.data.user);
      } else {
        throw new Error(response.errors?.[0] || 'Signup failed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setError(null);
    await authApi.logout();
    setUser(null);
    clearAuthToken();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
