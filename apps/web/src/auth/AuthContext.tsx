"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiClient } from "@/api/client";

type User = {
  id: number;
  email: string | null;
  name: string | null;
  phoneNumber: string | null;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadUser() {
    const token = localStorage.getItem("secretin_token");
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const response = await apiClient.get("/auth/me");
      setUser(response.data);
    } catch {
      localStorage.removeItem("secretin_token");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  async function signIn(token: string) {
    localStorage.setItem("secretin_token", token);
    await loadUser();
  }

  function signOut() {
    localStorage.removeItem("secretin_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth precisa ser usado dentro de um AuthProvider");
  }
  return context;
}