"use client";

import { useCart } from "@/context/CartContext";
import { Product } from "@/types";
import API from "@/lib/axios";
import { ArrowLeft, Minus, Package, Plus, ShoppingCart } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await API.get<{ data: Product }>(`/products/${id}`);
      setProduct(res.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (price: number) =>
    `₹${price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  const habdleAddToCart = async () => {
    if (!product) return;

    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-500 text-sm animate-pulse">
          Loading products...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 text-sm mb-3">Product not found</p>
          <Link
            href="/products"
            className="text-orange-400 hover:text-orange-300 text-sm"
          >
            ← Back to products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="mex-w-5xl mx-auto px-6 py-8">
        {/* Back Link */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden aspect-square">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-16 h-16 text-slate-700" />
              </div>
            )}
          </div>

          <div>
            {product.category_name && (
              <span className="inline-block bg-slate-900 border border-slate-800 text-slate-400 text-xs px-3 py-1 rounded-full mb-3">
                {product.category_name}
              </span>
            )}

            <h1 className="text-2xl font-bold text-white mb-3">
              {product.name}
            </h1>
            <p className="text-orange-400 text-3xl font-bold mb-4">
              {fmt(product.price)}
            </p>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              {product.description || "No description available."}
            </p>

            <div className="mb-6">
              {product.stock > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-400 text-sm">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full">
                    {" "}
                  </span>
                  In Stock — {product.stock} available
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-red-400 text-sm">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                  Out of Stock
                </span>
              )}
            </div>

            {product.stock > 0 && (
              <div className="flex items-center gap-4 mb-6">
                <span className="text-slate-300 text-sm font-medium">
                  Quantity
                </span>
                <div className="flex items-center gap-3 bg-slate-900 border-slate-800 rounded-xl px-3 py-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-white text-sm font-semibold w-6 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={habdleAddToCart}
              disabled={product.stock === 0}
              className="w-full flex items-center justify-center gap-2
                 bg-orange-500 hover:bg-orange-400 disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              {added
                ? "Added to cart!"
                : product.stock === 0
                  ? "Out of Stock"
                  : "Add to cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
