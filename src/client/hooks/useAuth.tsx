"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { authClient } from "@server/auth/client";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  bio?: string;
  stats?: { articles: number; comments: number; likes: number; achievements: string[] };
  isBlocked?: boolean;
  rating?: number;
  theme?: "light" | "dark";
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const session = await authClient.getSession();
      if (session?.user) {
        setUser(session.user as User);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const signIn = async (email: string, password: string) => {
    const res = await authClient.signIn.email({ email, password });
    if (!res.data) throw new Error("Failed to sign in");
    await refreshUser();
  };

  const signUp = async (name: string, email: string, password: string) => {
    const res = await authClient.signUp.email({ name, email, password });
    if (!res.data) throw new Error("Failed to sign up");
    await refreshUser();
  };

  const signOut = async () => {
    await authClient.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
