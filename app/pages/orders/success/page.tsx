"use client";

import { useRequireAuth } from "@/hooks/useRequiredAuth";
import axios from "axios";
import { ArrowBigRight, CheckCircle, Home, Package } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image_url: string;
}

interface OrderDetails {
  id: number;
  total_amount: number;
  status: string;
  created_at: string;
  items: OrderItem[];
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const res = await axios.get(`/api/orders/${orderId}`, {
        withCredentials: true,
      });
      setOrder(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (price: number) =>
    `₹${price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm animate-pulse">
            Loading your order...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Order Confirmed!
          </h1>
          <p className="text-slate-400 text-xs">
            Thank you for your purchase. Your order has been placed
            successfully.
          </p>
          {orderId && (
            <div className="inline-block mt-3 bg-slate-900 border border-slate-800 rounded-lg px-4 py-1.5">
              <span className="text-slate-500 text-xs">Order ID: </span>
              <span className="text-orange-400 text-xs">#{orderId}</span>
            </div>
          )}
        </div>

        {order && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mb-4">
            <div className="p-5 border-b border-slate-800">
              <h2 className="text-white text-xs font-semibold mb-4">
                Items Ordered
              </h2>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-800 rounded-lg overflow-hidden shrink-0">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full items-center justify-center">
                          <Package className="w-4 h-4 text-slate-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{item.name}</p>
                      <p className="text-slate-500 text-xs">{item.quantity}</p>
                    </div>
                    <p className="text-white text-xs font-medium shrink-0">
                      {fmt(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400 text-sm">Subtotal</span>
                <span className="text-white text-sm">
                  {fmt(order.total_amount)}
                </span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-slate-400" text-sm>
                  Shipping
                </span>
                <span className="text-emerald-400 text-sm">Free</span>
              </div>
              <div className="border-t border-slate-800 pt-3 flex justify-between items-center">
                <span className="text-white font-semibold">Total Paid</span>
                <span className="text-orange-400 font-bold text-lg">
                  {fmt(order.total_amount)}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6">
          <h2 className="text-white text-sm font-semibold mb-3">
            What's Next?
          </h2>
          <div className="space-y-2">
            {[
              "Your order is being processed",
              "You'll receive a confirmation shortly",
              "Your items will be shipped soon",
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0">
                  <span className="text-orange-400 text-xs font-bold">
                    {i + 1}
                  </span>
                </div>
                <p className="text-slate-400 text-sm">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/pages/orders"
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
          >
            View All Orders
            <ArrowBigRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-medium py-3 rounded-xl transition-colors"
          >
            <Home />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <SuccessContent />
    </Suspense>
  );
}
