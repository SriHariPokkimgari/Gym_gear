"use client";

import { useAuth } from "@/context/AuthContext";
import { Category, Product } from "@/types";
import API from "@/lib/axios";
import {
  Check,
  LayoutDashboard,
  Package,
  Pencil,
  Plus,
  ShoppingBag,
  Target,
  Trash2,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

type Tab = "overview" | "products" | "orders";

interface Stats {
  revenue: number;
  orders: number;
  users: number;
  products: number;
}

interface AdminOrder {
  id: number;
  total_amount: number;
  status: "paid" | "pending" | "cancelled";
  created_at: string;
  user_name: string;
  user_email: string;
  item_count: number;
}

interface ProductForm {
  name: string;
  description: string;
  price: string;
  stock: string;
  image_url: string;
  category_id: string;
}

const EmptyForm: ProductForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  image_url: "",
  category_id: "",
};

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ProductForm>(EmptyForm);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== "admin") {
      router.push("/");
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchAll();
    }
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);

    try {
      const [statsRes, productsRes, ordersRes, categoriesRes] =
        await Promise.all([
          API.get("/admin/stats", { withCredentials: true }),
          API.get("/admin/products", { withCredentials: true }),
          API.get("/admin/orders", { withCredentials: true }),
          API.get("/categories"),
        ]);
      setStats(statsRes.data.data);
      setProducts(productsRes.data.data);
      setOrders(ordersRes.data.data);
      setCategories(categoriesRes.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (price: number) =>
    `₹${Number(price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const handleCreateProduct = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);
    try {
      await API.post(
        "/products",
        {
          ...formData,
          price: parseInt(formData.price),
          stock: parseInt(formData.price),
          category_id: parseInt(formData.category_id),
        },
        { withCredentials: true },
      );
      setSuccess("Products created successfully!");
      setShowForm(false);
      setFormData(EmptyForm);
      fetchAll();
    } catch (error: any) {
      setError(error.response?.data?.message || "Something went wrong.");
    } finally {
      setFormLoading(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleUpdateProduct = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setFormLoading(true);
    setError(null);

    try {
      await API.put(
        `/products/${editingId}`,
        {
          ...formData,
          price: parseInt(formData.price),
          stock: parseInt(formData.stock),
          category_id: parseInt(formData.category_id),
        },
        { withCredentials: true },
      );
      setSuccess("Product updated successfully!");
      setShowForm(false);
      setEditingId(null);
      setFormData(EmptyForm);
      fetchAll();
    } catch (error: any) {
      setError(error.response?.data?.message || "Something went wrong.");
    } finally {
      setFormLoading(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await API.delete(`/products/${id}`, { withCredentials: true });
      setSuccess("Product deleted.");
      fetchAll();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || "Something went wrong.");
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      image_url: product.image_url || "",
      category_id: product.category_id.toString(),
    });
    setShowForm(true);
  };

  const handleUpdateOrderStatus = async (id: number, status: string) => {
    try {
      await API.put(
        `/admin/orders/${id}`,
        { status },
        { withCredentials: true },
      );
      setSuccess("Order status updated.");
      fetchAll();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error(error);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage your GymGear store
          </p>
        </div>

        {/* Success / Error */}
        {success && (
          <div className="mb-4 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <p className="text-emerald-400 text-sm">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div>
          {(
            [
              { key: "overview", label: "Overview", icon: LayoutDashboard },
              { key: "products", label: "Products", icon: Package },
              { key: "orders", label: "Orders", icon: ShoppingBag },
            ] as const
          ).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === key
                  ? "border-orange-500 text-orange-400"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {tab === "overview" && stats && (
          <div>
            {[
              {
                label: "Total Revenue",
                value: fmt(stats.revenue),
                icon: TrendingUp,
                color: "text-orange-400",
              },
              {
                label: "Total Orders",
                value: stats.orders,
                icon: ShoppingBag,
                color: "text-emerald-400",
              },
              {
                label: "Total Users",
                value: stats.users,
                icon: Users,
                color: "text-blue-400",
              },
              {
                label: "Total Products",
                value: stats.products,
                icon: Package,
                color: "text-purple-400",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-2"
              >
                <div className="flex items-center gap-2 mb-3">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  <p className="text-slate-400 text-sm font-medium">
                    {stat.label}
                  </p>
                </div>
                <p className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* PRODUCTS TAB */}
        {tab === "products" && (
          <div>
            {/* Add product buton */}
            <div className="flex justify-end mb-4">
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  setEditingId(null);
                  setFormData(EmptyForm);
                }}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
              >
                {showForm ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {showForm ? "cancel" : "Add product"}
              </button>
            </div>

            {/* Product Form */}
            {showForm && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
                <h2 className="text-white font-semibold mb-4 text-sm">
                  {editingId ? "Edit product" : "New Product"}
                </h2>
                <form
                  onSubmit={
                    editingId ? handleUpdateProduct : handleCreateProduct
                  }
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                    {[
                      {
                        label: "Prroduct Name",
                        key: "name",
                        type: "text",
                        placeholder: "e.g. Adjustable Dummell",
                      },
                      {
                        label: "price (₹)",
                        key: "price",
                        type: "number",
                        placeholder: "e.g. 4999",
                      },
                      {
                        label: "Stock",
                        key: "stock",
                        type: "number",
                        placeholder: "e.g. 49",
                      },
                      {
                        label: "Image URL",
                        key: "image_url",
                        type: "text",
                        placeholder: 'e.g. "https://..."',
                      },
                    ].map(({ label, key, type, placeholder }) => (
                      <div key={key}>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">
                          {label}
                        </label>
                        <input
                          type={type}
                          placeholder={placeholder}
                          value={formData[key as keyof ProductForm]}
                          onChange={(e) =>
                            setFormData({ ...formData, [key]: e.target.value })
                          }
                          required={key !== "image_url"}
                          className="w-full bg-slate-800 border-slate-700 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                        />
                      </div>
                    ))}

                    {/* Category */}
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">
                        Category
                      </label>
                      <select
                        required
                        value={formData.category_id}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            category_id: e.target.value,
                          })
                        }
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                      >
                        <option value="">Select category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Description */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">
                        Description
                      </label>
                      <textarea
                        placeholder="Product description..."
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="bg-orange-500 hover:bg-orange-400 disabled:bg-orange-500/50 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
                    >
                      {formLoading
                        ? "Saving..."
                        : editingId
                          ? "Update Prosuct"
                          : "Create Product"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingId(null);
                        setFormData(EmptyForm);
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm px-6 py-2.5 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Products table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 border-b border-slate-800">
                <div className="col-span-5 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Product
                </div>
                <div className="col-span-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Price
                </div>
                <div className="col-span-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Stock
                </div>
                <div className="col-span-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Category
                </div>
                <div className="col-span-1"></div>
              </div>

              {products.length === 0 && (
                <div className="px-5 py-12 text-center">
                  <p className="text-slate-500 text-sm">No prroducts yet</p>
                </div>
              )}

              {products.map((product) => (
                <div
                  key={product.id}
                  className="group bordr-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition-colors"
                >
                  {/* Mobile */}
                  <div className="flex sm:hidden items-center justify-between gap-3 px-4 py-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-slate-800 rounded-lg overflow-hidden shrink-0 ">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-4 h-4 text-slate-600" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {product.name}
                        </p>
                        <p className="text-orange-400 text-xs">
                          {fmt(product.price)} · Stock: {product.stock}{" "}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => handleEditClick(product)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-700 hover:bg-red-500/20 hover:text-red-400 text-slate-300 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Desktop */}
                  <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3.5 items-center">
                    <div className="col-span-5 flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-800 rounded-lg overflow-hidden shrink-0">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-4 h-4 text-slate-600" />
                          </div>
                        )}
                      </div>
                      <p className="text-white text-sm font-medium truncate">
                        {product.name}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-orange-400 text-sm font-semibold">
                        {fmt(product.price)}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${product.stock > 10 ? "bg-emerald-500/10 text-emerald-400" : product.stock > 0 ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"}`}
                      >
                        {product.stock > 0
                          ? `${product.stock} in stock`
                          : "Out of stock"}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <p className="text-slate-400 text-sm">
                        {product.category_name}
                      </p>
                    </div>
                    <div className="col-span-1 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditClick(product)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5 " />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-700 hover:bg-red-500/20 hover:text-red-400 text-slate-300 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {tab === "orders" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mt-5">
            <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 border-b border-slate-800">
              <div className="col-span-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                Order
              </div>
              <div className="col-span-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                Customer
              </div>
              <div className="col-span-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                Date
              </div>
              <div className="col-span-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                Total
              </div>
              <div className="col-span-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                Status
              </div>
            </div>

            {orders.length === 0 && (
              <div className="px-5 py-12 text-center">
                <p className="text-slate-500 text-sm">No orders yet</p>
              </div>
            )}

            {orders.map((order) => (
              <div
                key={order.id}
                className="border-b border-slate-800/50 last:border-0"
              >
                {/* Mobile */}
                <div className="flex sm:hidden items-center justify-between gap-3 px-4 py-3.5">
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium">
                      Order #{order.id}
                    </p>
                    <p className="text-slate-500 text-xs truncate">
                      {order.user_name} · {fmt(order.total_amount)}
                    </p>
                  </div>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleUpdateOrderStatus(order.id, e.target.value)
                    }
                    className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-orange-500 transition-colors"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Desktop */}
                <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-4 items-center">
                  <div className="col-span-2">
                    <p className="text-white text-sm font-medium">
                      #{order.id}
                    </p>
                    <p className="text-slate-500 text-xs">
                      {order.item_count} item{order.item_count > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="col-span-3">
                    <p className="text-white text-sm">{order.user_name}</p>
                    <p className="text-slate-500 text-xs truncate">
                      {order.user_email}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-slate-400 text-sm">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-orange-400 text-sm font-semibold">
                      {fmt(order.total_amount)}
                    </p>
                  </div>
                  <div className="col-span-3">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleUpdateOrderStatus(order.id, e.target.value)
                      }
                      className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-orange-500 transition-colors"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
