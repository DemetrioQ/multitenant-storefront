"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import * as authApi from "@/lib/auth";
import { getAuthToken, setAuthToken } from "@/lib/authToken";
import { decodeJwt, jwtExpiresInMs } from "@/lib/jwt";
import { ApiError, type CustomerClaims, type LoginResponse } from "@/lib/types";

type AuthState = {
  status: "loading" | "anonymous" | "authenticated";
  customer: CustomerClaims | null;
  token: string | null;
};

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  refresh: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const REFRESH_LEAD_MS = 30_000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading", customer: null, token: null });
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyToken = useCallback((token: string | null) => {
    setAuthToken(token);
    if (!token) {
      setState({ status: "anonymous", customer: null, token: null });
      return;
    }
    const customer = decodeJwt(token);
    if (!customer) {
      // JWT didn't even parse — something's wrong with the token format.
      console.warn("[auth] received token that failed JWT decode; clearing");
      setAuthToken(null);
      setState({ status: "anonymous", customer: null, token: null });
      return;
    }
    if (customer.sub_type && customer.sub_type !== "customer") {
      // Backend can emit merchant JWTs on the same host (shared signing key);
      // those should never be used here.
      console.warn(`[auth] rejecting non-customer JWT (sub_type=${customer.sub_type})`);
      setAuthToken(null);
      setState({ status: "anonymous", customer: null, token: null });
      return;
    }
    // Accept the token even if sub_type is absent — the backend enforces
    // customer-only access on every protected endpoint, so we don't gate
    // the UI on a claim whose exact spelling we can't guarantee.
    setState({ status: "authenticated", customer, token });
  }, []);

  const scheduleRefresh = useCallback(
    (token: string) => {
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
      const expiresIn = jwtExpiresInMs(token);
      if (expiresIn === null) return;
      const delay = Math.max(5_000, expiresIn - REFRESH_LEAD_MS);
      refreshTimeoutRef.current = setTimeout(async () => {
        try {
          const res = await authApi.refresh();
          applyToken(res.jwtToken);
        } catch {
          applyToken(null);
        }
      }, delay);
    },
    [applyToken]
  );

  const refresh = useCallback(async (): Promise<boolean> => {
    try {
      const res = await authApi.refresh();
      applyToken(res.jwtToken);
      scheduleRefresh(res.jwtToken);
      return true;
    } catch (err) {
      applyToken(null);
      if (err instanceof ApiError && err.status === 401) return false;
      throw err;
    }
  }, [applyToken, scheduleRefresh]);

  const login = useCallback(
    async (email: string, password: string): Promise<LoginResponse> => {
      const res = await authApi.login({ email, password });
      applyToken(res.jwtToken);
      scheduleRefresh(res.jwtToken);
      return res;
    },
    [applyToken, scheduleRefresh]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // best effort — still clear local state
    }
    applyToken(null);
    if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
  }, [applyToken]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await authApi.refresh();
        if (!cancelled) {
          applyToken(res.jwtToken);
          scheduleRefresh(res.jwtToken);
        }
      } catch {
        if (!cancelled) applyToken(null);
      }
    })();
    return () => {
      cancelled = true;
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    };
  }, [applyToken, scheduleRefresh]);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === "storefront:auth-logout") applyToken(null);
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [applyToken]);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, login, logout, refresh }),
    [state, login, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

export function useCurrentToken(): string | null {
  useAuth();
  return getAuthToken();
}
