"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Package, ArrowLeft, CheckCircle, Clock, XCircle } from "lucide-react";
import Link from "next/link";
import { useRequireAuth } from "@/hooks/useRequiredAuth";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image_url: string;
}

interface OrderDetail {
  id: number;
  total_amount: number;
  status: "pending" | "paid" | "cancelled";
  created_at: string;
  stripe_payment_id: string;
  items: OrderItem[];
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isLoggedIn, loading: authLoading } = useRequireAuth();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoggedIn) fetchOrder();
  }, [isLoggedIn, id]);

  const fetchOrder = async () => {
    try {
      const res = await axios.get(`/api/orders/${id}`, {
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

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case "pending":
        return <Clock className="w-5 h-5 text-amber-400" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return null;
    }
  };

  const statusStyle = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "pending":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  if (authLoading || !isLoggedIn || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 text-sm mb-3">Order not found</p>
          <Link
            href="/pages/orders"
            className="text-orange-400 hover:text-orange-300 text-sm"
          >
            ← Back to orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </button>

        {/* Order header */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="text-white font-bold text-lg mb-1">
                Order #{order.id}
              </h1>
              <p className="text-slate-500 text-xs">
                {formatDate(order.created_at)}
              </p>
            </div>
            <span
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${statusStyle(order.status)}`}
            >
              <StatusIcon status={order.status} />
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>

          {order.stripe_payment_id && (
            <div className="bg-slate-800 rounded-lg px-3 py-2">
              <p className="text-slate-500 text-xs">Payment ID</p>
              <p className="text-slate-300 text-xs font-mono truncate">
                {order.stripe_payment_id}
              </p>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-4">
          <h2 className="text-white text-sm font-semibold mb-4">Items</h2>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-14 h-14 bg-slate-800 rounded-xl overflow-hidden shrink-0">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-slate-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {item.name}
                  </p>
                  <p className="text-slate-500 text-xs">Qty: {item.quantity}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-white text-sm font-medium">
                    {fmt(item.price * item.quantity)}
                  </p>
                  <p className="text-slate-500 text-xs">
                    {fmt(item.price)} each
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-400 text-sm">Subtotal</span>
            <span className="text-white text-sm">
              {fmt(order.total_amount)}
            </span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-slate-400 text-sm">Shipping</span>
            <span className="text-emerald-400 text-sm">Free</span>
          </div>
          <div className="border-t border-slate-800 pt-3 flex justify-between">
            <span className="text-white font-semibold">Total</span>
            <span className="text-orange-400 font-bold text-lg">
              {fmt(order.total_amount)}
            </span>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/products"
          className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
