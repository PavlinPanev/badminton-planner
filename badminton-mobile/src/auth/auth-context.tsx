import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { ApiError, apiEndpoint, readApiError } from '@/lib/api';
import { deleteStoredAuthValue, getStoredAuthValue, setStoredAuthValue } from './token-storage';

const tokenStorageKey = 'badminton.jwt';
const userStorageKey = 'badminton.user';

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'coach' | 'parent';
  photoUrl?: string | null;
};

type LoginResponse = {
  token: string;
  tokenType: 'Bearer';
  user: AuthUser;
};

type AuthContextValue = {
  isLoading: boolean;
  isLoggedIn: boolean;
  token: string | null;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      const [storedToken, storedUser] = await Promise.all([
        getStoredAuthValue(tokenStorageKey),
        getStoredAuthValue(userStorageKey),
      ]);

      if (!isMounted) {
        return;
      }

      setToken(storedToken);
      setUser(storedUser ? (JSON.parse(storedUser) as AuthUser) : null);
      setIsLoading(false);
    }

    restoreSession().catch(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch(apiEndpoint('/auth/login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    }).catch(() => {
      throw new ApiError('Unable to reach the Badminton Planner API.');
    });

    if (!response.ok) {
      throw new ApiError(await readApiError(response), response.status);
    }

    const body = (await response.json()) as LoginResponse;

    if (!body.token || body.tokenType !== 'Bearer' || !body.user) {
      throw new ApiError('The login response was missing authentication details.');
    }

    await Promise.all([
      setStoredAuthValue(tokenStorageKey, body.token),
      setStoredAuthValue(userStorageKey, JSON.stringify(body.user)),
    ]);

    setToken(body.token);
    setUser(body.user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const response = await fetch(apiEndpoint('/auth/register'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    }).catch(() => {
      throw new ApiError('Unable to reach the Badminton Planner API.');
    });

    if (!response.ok) {
      throw new ApiError(await readApiError(response), response.status);
    }

    const body = (await response.json()) as LoginResponse;

    if (!body.token || body.tokenType !== 'Bearer' || !body.user) {
      throw new ApiError('The register response was missing authentication details.');
    }

    await Promise.all([
      setStoredAuthValue(tokenStorageKey, body.token),
      setStoredAuthValue(userStorageKey, JSON.stringify(body.user)),
    ]);

    setToken(body.token);
    setUser(body.user);
  }, []);

  const logout = useCallback(async () => {
    await Promise.all([deleteStoredAuthValue(tokenStorageKey), deleteStoredAuthValue(userStorageKey)]);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      isLoading,
      isLoggedIn: Boolean(token),
      token,
      user,
      login,
      register,
      logout,
    }),
    [isLoading, login, register, logout, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }

  return context;
}
