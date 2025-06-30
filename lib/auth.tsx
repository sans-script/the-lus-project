"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { apiClient, LoginData, RegisterData, User } from "./api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }

    try {
      const savedToken = localStorage.getItem("auth_token");
      const savedUser = localStorage.getItem("auth_user");
      if (
        savedToken &&
        savedUser &&
        savedToken !== "undefined" &&
        savedUser !== "undefined" &&
        savedUser !== "null"
      ) {
        const parsedUser = JSON.parse(savedUser);

        if (parsedUser && typeof parsedUser === "object") {
          setToken(savedToken);
          setUser(parsedUser);
        } else {
          console.warn("🔐 Dados de usuário inválidos, limpando localStorage");

          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_user");
        }
      } else {
      }
    } catch (error) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      localStorage.removeItem("user");
    }
    setIsLoading(false);
  }, []);

  const login = async (data: LoginData) => {
    try {
      setIsLoading(true);
      const response = await apiClient.login(data);

      if (response && response.token && response.user) {
        setToken(response.token);
        setUser(response.user);

        localStorage.setItem("auth_token", response.token);
        localStorage.setItem("auth_user", JSON.stringify(response.user));
      } else {
        throw new Error(
          "Resposta inválida do servidor - dados de usuário não encontrados"
        );
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      await apiClient.register(data);

      await login({ email: data.email, password: data.password });
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");

    localStorage.removeItem("user");
  };

  const getToken = (): string | null => {
    const currentToken =
      token ||
      (typeof window !== "undefined"
        ? localStorage.getItem("auth_token")
        : null);
    return currentToken;
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token,
    getToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
