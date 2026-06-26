"use client";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import {
  ArrowBigRight,
  ArrowRight,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, totalItems, totalPrice } =
    useCart();
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  const fmt = (price: number) => {
    return `₹${price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  };

  const handleCheckout = () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    router.push("/checkout");
  };

  //Empty cart state
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-7 h-7 text-slate-600" />
          </div>
          <h2 className="text-white font-semibold mb-1">Your cart is empty</h2>
          <p className="text-slate-500 text-sm mb-6">
            Looks like you haven't added anything yet
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            Browse Products
            <ArrowBigRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Your Cart</h1>
          <p className="text-slate-400 text-sm mt-1">
            {items.reduce((sum, item) => sum + item.quantity, 0)} item
            {items.length > 1 ? "s" : ""} in cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4"
              >
                <div className="flex items-center gap-4">
                  {/* Image */}
                  <div className="w-20 h-20 bg-slate-800 rounded-xl overflow-hidden shrink-0">
                    {item.product.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-slate-600" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.product.id}`}>
                      <h3 className="text-white text-sm font-medium hover:text-orange-400 transition-colors truncate">
                        {item.product.name}
                      </h3>
                    </Link>
                    <p className="text-orange-400 text-sm font-semibold mt-1">
                      {fmt(item.product.price)}
                    </p>
                  </div>

                  {/* Delete — always top right on mobile too */}
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-slate-500 hover:text-red-400 transition-colors shrink-0 self-start"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Bottom row — quantity + subtotal, full width on all screens */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800">
                  {/* Quantity — visible on ALL screen sizes now */}
                  <div className="flex items-center gap-3 bg-slate-800 rounded-lg px-2 py-1.5">
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity - 1)
                      }
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-white text-sm font-semibold w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity + 1)
                      }
                      disabled={item.quantity >= item.product.stock}
                      className="text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <p className="text-white text-sm font-semibold">
                    {fmt(item.product.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sticky top-24">
              <h2 className="text-white font-semibold mb-4">Order Summary</h2>

              <div className="space-y-2 mb-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Subtotal</span>
                  <span className="text-white">{fmt(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Shipping</span>
                  <span className="text-emerald-400">Free</span>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3 mb-5">
                <div className="flex justify-between">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-orange-400 font-bold text-lg">
                    {fmt(totalPrice)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
              >
                {isLoggedIn ? "Proceed to Checkout" : "Login to checkout"}
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                href="/products"
                className="block text-center text-slate-400 hover:text-white text-xs mt-3 transition-colors"
              >
                ← Continue shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
