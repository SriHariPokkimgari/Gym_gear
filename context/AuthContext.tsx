"use client";

import { CartItem } from "@/types";
import axios from "axios";
import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthUser {
  id: number;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoggedIn: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await axios.get("/api/auth/me", { withCredentials: true });
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    await checkAuth();

    const guestCart = localStorage.getItem("gymgear_guest_cart");
    if (guestCart) {
      const items = JSON.parse(guestCart);
      if (items.length > 0) {
        await axios.post(
          "/api/cart/merge",
          {
            items: items.map((item: CartItem) => ({
              product_id: item.product.id,
              quantity: item.quantity,
            })),
          },
          { withCredentials: true },
        );
        localStorage.removeItem("gymgear_guest_cart");
      }
    }
  };

  const logout = async () => {
    await axios.post("/api/auth/logout", {}, { withCredentials: true });
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("UseAuth must be used within AuthProvider.");
  return context;
};
