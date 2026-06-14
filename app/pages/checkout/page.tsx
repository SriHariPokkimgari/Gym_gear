"use client";

import { useCart } from "@/context/CartContext";
import axios from "axios";
import { CreditCard, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fmt = (price: number) =>
    `₹${price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  const handlePayment = async () => {
    setLoading(true);

    try {
      const loaded = await loadRazorpay();
      if (!loaded) {
        setError("Failed to load payment gateway. Check your internet.");
        setLoading(false);
        return;
      }

      const res = await axios.post(
        "/api/checkout",
        {
          items: items.map((item) => ({
            product_id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
          })),
        },
        { withCredentials: true },
      );

      const { orderId, razorpayOrderId, amount, currency, keyId } = res.data;

      const options = {
        key: keyId,
        amount,
        currency,
        name: "GymGear",
        description: "Gym Equipment Purchase",
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          try {
            await axios.post(
              "/api/checkout/verify",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_id: orderId,
              },
              { withCredentials: true },
            );

            clearCart();
            router.push(`/pages/orders/success?order_id=${orderId}`);
          } catch {
            setError("Payment verification failed. Contact support.");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: "",
          email: "",
        },
        theme: {
          color: "#f97316",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      setError(error.response?.data?.message || "Something went wrong.");
      setLoading(false);
    }
  };

  if (items.length === 0) {
    router.push("/pages/cart");
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">Checkout</h1>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-4">
          <h2 className="text-white font-semibold mb-4 text-sm">Order Items</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.product.id} className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-800 rounded-lg overflow-hidden shrink-0">
                  {item.product.image_url ? (
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-4 h-4 text-slate-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">
                    {item.product.name}
                  </p>
                  <p className="text-slate-500 text-xs">{item.quantity}</p>
                </div>
                <p className="text-white text-sm font-medium">
                  {fmt(item.product.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-white font-semibold">Total Amount</span>
              <span className="text-orange-400 font-bold text-xl">
                {fmt(totalPrice)}
              </span>
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:bg-orange-500/50 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors"
          >
            <CreditCard className="w-4 h-4" />
            {loading ? "Opening payment..." : `Pay ${fmt(totalPrice)}`}
          </button>

          <p className="text-center text-slate-500 text-xs mt-4">
            🔒 Secure payment powered by Razorpay
          </p>
        </div>
      </div>
    </div>
  );
}
