"use client";

//import { useRequireAuth } from "@/hooks/useRequiredAuth";
import API from "@/lib/axios";
import { ChevronRight, Package, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Order {
  id: number;
  total_amount: number;
  status: "pending" | "paid" | "cancelled";
  created_at: string;
  item_count: number;
}

export default function OrdersPage() {
  //const { isLoggedIn, loading: authLoading } = useRequireAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders", { withCredentials: true });
      setOrders(res.data.data);
    } catch (error: any) {
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
      month: "short",
      year: "numeric",
    });

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">My Orders</h1>
          <p className="text-slate-400 text-sm mt-1">
            {orders?.length} order{orders?.length !== 1 ? "s" : ""} placed
          </p>
        </div>

        {loading && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-slate-900 border border-slate-800 rounded-2xl h-24 animate-pulse"
              />
            ))}
          </div>
        )}

        {!loading && orders?.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-7 h-7 text-slate-600" />
            </div>
            <h2 className="text-white font-semibold mb-1">No orders yet</h2>
            <p className="text-slate-500 text-sm mb-6">
              Start shopping to see your orders here
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold px-5 py-2.5 rounded-2xl transition-colors"
            >
              Browse Products
            </Link>
          </div>
        )}

        {!loading && orders?.length > 0 && (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all group"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Icon */}
                    <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-slate-500" />
                    </div>

                    {/* Title + badge + date — all in ONE column now */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-white text-sm font-semibold">
                          Order #{order.id}
                        </p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border ${statusStyle(order.status)}`}
                        >
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs">
                        {formatDate(order.created_at)} · {order.item_count} item
                        {Number(order.item_count) !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  {/* Right side — price + chevron */}
                  <div className="flex items-center gap-2 shrink-0">
                    <p className="text-orange-400 font-bold text-sm whitespace-nowrap">
                      {fmt(order.total_amount)}
                    </p>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
