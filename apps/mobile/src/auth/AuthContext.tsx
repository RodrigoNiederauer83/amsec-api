import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiClient } from "../api/client";
import { authStorage } from "./authStorage";

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
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadUser() {
    const token = await authStorage.getToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const response = await apiClient.get("/auth/me");
      setUser(response.data);
    } catch {
      await authStorage.clearToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  async function signIn(token: string) {
    await authStorage.setToken(token);
    await loadUser();
  }

  async function signOut() {
    await authStorage.clearToken();
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