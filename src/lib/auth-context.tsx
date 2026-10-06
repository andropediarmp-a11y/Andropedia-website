"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { User } from "./types";

export function getPortalDestinationForUser(user?: User | null): string {
  if (!user) return "/portal/login";

  if (user.role === "super_admin") return "/portal/admin";
  if (user.role === "domain_admin") return "/portal/evaluations";

  return "/portal/dashboard";
}

type StepResult = { ok: true } | { ok: false; error: string };

interface AuthContextType {
  currentUser: User | null;
  /** Emails a one-time login code to a club member. */
  requestCode: (email: string) => Promise<StepResult>;
  /** Exchanges the emailed code for a session; returns the user on success. */
  verifyCode: (email: string, code: string) => Promise<{ user: User } | { error: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function postJson(url: string, body?: unknown) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return await res.json();
  } catch {
    return { success: false, error: "Network error. Please check your connection and try again." };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // The session lives in an HTTP-only cookie; ask the server who we are.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/me", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setCurrentUser(data?.user ?? null);
      })
      .catch(() => {
        if (!cancelled) setCurrentUser(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const requestCode = useCallback(async (email: string): Promise<StepResult> => {
    const data = await postJson("/api/auth/request-code", { email });
    return data.success ? { ok: true } : { ok: false, error: data.error || "Could not send the code." };
  }, []);

  const verifyCode = useCallback(async (email: string, code: string) => {
    const data = await postJson("/api/auth/verify-code", { email, code });
    if (data.success && data.user) {
      setCurrentUser(data.user as User);
      return { user: data.user as User };
    }
    return { error: (data.error as string) || "That code is invalid or has expired." };
  }, []);

  const logout = useCallback(async () => {
    await postJson("/api/auth/logout");
    setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, requestCode, verifyCode, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
