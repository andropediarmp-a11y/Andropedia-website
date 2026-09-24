"use client";

import React, { createContext, useContext, useState } from "react";
import { User, RoleType } from "./types";

export function getPortalDestinationForUser(user?: User | null): string {
  if (!user) return "/portal/login";
  if (user.role === "super_admin") return "/portal/admin";
  if (user.role === "domain_admin") return "/portal/evaluations";
  return "/portal/dashboard";
}

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  login: (email: string, role?: RoleType) => Promise<User | null>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    const saved = window.localStorage.getItem("andropedia_user");
    if (!saved) return null;
    try { return JSON.parse(saved) as User; }
    catch { window.localStorage.removeItem("andropedia_user"); return null; }
  });
  const [isLoading] = useState(false);

  const handleSetCurrentUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem("andropedia_user", JSON.stringify(user));
  };

  const login = async (email: string, role?: RoleType): Promise<User | null> => {
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, role }) });
      const data = await res.json();
      if (data.success && data.user) { handleSetCurrentUser(data.user); return data.user; }
      return null;
    } catch (err) { console.error("Login failed:", err); return null; }
  };

  const logout = () => { setCurrentUser(null); localStorage.removeItem("andropedia_user"); };

  return <AuthContext.Provider value={{ currentUser, setCurrentUser: handleSetCurrentUser, login, logout, isLoading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
