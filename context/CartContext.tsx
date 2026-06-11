"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CartItem, Product } from "@/types";
import { useAuth } from "./AuthContext";
import axios from "axios";

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  fetchCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (isLoggedIn) {
      fetchCart();
    } else {
      const saved = localStorage.getItem("gymgear_guest_cart");
      if (saved) setItems(JSON.parse(saved));
    }
  }, [isLoggedIn]);

  const fetchCart = async () => {
    try {
      const res = await axios.get("/api/cart", { withCredentials: true });
      const cartItems: CartItem[] = res.data.data.map((item: any) => ({
        product: {
          id: item.product_id,
          name: item.name,
          price: item.price,
          image_url: item.image_url,
          stock: item.stock,
          category_name: item.category_name,
        },
        quantity: item.quantity,
      }));
      setItems(cartItems);
    } catch (error) {
      console.error("Fetch cart error: ", error);
    }
  };

  const saveGuestCart = (newItem: CartItem[]) => {
    localStorage.setItem("gymgear_guest_cart", JSON.stringify(newItem));
  };

  const addToCart = async (product: Product) => {
    if (isLoggedIn) {
      await axios.post(
        "/api/cart/add",
        { product_id: product.id, quantity: 1 },
        { withCredentials: true },
      );
      await fetchCart();
    } else {
      const existing = items.find((item) => item.product.id === product.id);
      const newItems = existing
        ? items.map((i) =>
            i.product.id === product.id
              ? { ...i, quantity: i.quantity + 1 }
              : i,
          )
        : [...items, { product, quantity: 1 }];
      setItems(newItems);
      saveGuestCart(newItems);
    }
  };

  const removeFromCart = async (productId: number) => {
    if (isLoggedIn) {
      await axios.delete("/api/cart/remove", {
        data: { product_id: productId },
        withCredentials: true,
      });
      await fetchCart();
    } else {
      const newItems = items.filter((item) => item.product.id !== productId);
      setItems(newItems);
      saveGuestCart(newItems);
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (isLoggedIn) {
      await axios.put(
        "/api/cart/update",
        { product_id: productId, quantity },
        { withCredentials: true },
      );
      await fetchCart();
    } else {
      const newItems =
        quantity <= 0
          ? items.filter((item) => item.product.id !== productId)
          : items.map((item) =>
              item.product.id === productId ? { ...item, quantity } : item,
            );

      setItems(newItems);
      saveGuestCart(newItems);
    }
  };

  const clearCart = async () => {
    if (isLoggedIn) {
      await axios.delete("/api/cart/removeall", { withCredentials: true });
      await fetchCart();
    } else {
      setItems([]);
      localStorage.removeItem("gymgear_guest_cart");
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
