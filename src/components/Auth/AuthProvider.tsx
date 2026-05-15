import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  clearStoredToken,
  getStoredToken,
  setStoredToken,
  STORE_TOKEN_KEY,
} from "@/lib/api/http";
import { getMe } from "@/lib/api/auth";
import { getUserById } from "@/lib/api/users";
import type { AuthUser, JwtMeResponse } from "@/lib/types";

type User = AuthUser | null;

type AuthContextType = {
  user: User;
  initializing: boolean;
  token: string | null;
  setToken: (token: string | null) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

function normalizeMe(me: JwtMeResponse): AuthUser {
  return {
    id: Number(me.id ?? me.sub),
    name: me.name,
    email: me.email,
    role: me.role,
    isActive: me.isActive,
    tokenVersion: me.tokenVersion,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<User>(null);
  const [tokenState, setTokenState] = useState<string | null>(() =>
    getStoredToken(),
  );

  async function hydrateFromStorage() {
    const token = getStoredToken();
    setTokenState(token);

    if (!token) {
      setUser(null);
      setInitializing(false);
      return;
    }

    try {
      const me = await getMe();
      const normalized = normalizeMe(me);

      if (!normalized.id || Number.isNaN(normalized.id)) {
        setUser(normalized);
        return;
      }

      try {
        const fullUser = await getUserById(normalized.id);
        setUser(fullUser);
      } catch {
        setUser(normalized);
      }
    } catch {
      clearStoredToken();
      setTokenState(null);
      setUser(null);
    } finally {
      setInitializing(false);
    }
  }

  async function setToken(token: string | null) {
    if (token) {
      setStoredToken(token);
      setTokenState(token);
    } else {
      clearStoredToken();
      setTokenState(null);
      setUser(null);
      setInitializing(false);
      return;
    }

    await hydrateFromStorage();
  }

  function logout() {
    clearStoredToken();
    setTokenState(null);
    setUser(null);
    setInitializing(false);
  }

  async function refresh() {
    await hydrateFromStorage();
  }

  useEffect(() => {
    hydrateFromStorage();
  }, []);

  useEffect(() => {
    function onStorage(ev: StorageEvent) {
      if (ev.key === STORE_TOKEN_KEY) {
        hydrateFromStorage();
      }
    }

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo(
    () => ({
      user,
      initializing,
      token: tokenState,
      setToken,
      logout,
      refresh,
    }),
    [user, initializing, tokenState],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return ctx;
}