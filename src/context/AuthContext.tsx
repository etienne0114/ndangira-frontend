import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export type UserRole = "ADMIN" | "SELLER" | "CUSTOMER";
export type SellerStatus = "PENDING" | "APPROVED" | "REJECTED" | null;

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  sellerStatus: SellerStatus;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "ndangira_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, token: null, loading: true });

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setState({ user: null, token: null, loading: false });
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Invalid token");
      const user = (await res.json()) as AuthUser;
      setState({ user, token, loading: false });
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setState({ user: null, token: null, loading: false });
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  function login(token: string, user: AuthUser) {
    localStorage.setItem(TOKEN_KEY, token);
    setState({ user, token, loading: false });
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setState({ user: null, token: null, loading: false });
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
