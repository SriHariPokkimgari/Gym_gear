"use client";

import ProductCard from "@/components/ProductCard";
import { Category, Product } from "@/types";
import API from "@/lib/axios";
import { Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const res = await API.get("/categories");
      setCategories(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProducts = async () => {
    try {
      const params: Record<string, string> = {};
      if (selectedCategory) params.category = selectedCategory;
      if (search) params.search = search;

      const res = await API.get("/products/", { params });
      setProducts(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Shop Gym Equipment
          </h1>
          <p className="text-slate-400 text-sm">
            {products.length} products available
          </p>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 text-white placeholder-slate-500 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory("")}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors
                    ${
                      selectedCategory === ""
                        ? "bg-orange-500 text-white"
                        : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                    } 
                  `}
            >
              All
            </button>
            {categories.map((cart) => (
              <button
                key={cart.id}
                onClick={() => setSelectedCategory(cart.name)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors
                    ${
                      selectedCategory === cart.name
                        ? "bg-orange-500 text-white"
                        : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                    } 
                  `}
              >
                {cart.name}
              </button>
            ))}
          </div>
        </div>
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-slate-900 border border-slate-800 rounded-2xl aspect-square animate-pulse "
              />
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-20">
            <SlidersHorizontal className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No Products found</p>
            <p className="text-slate-600 text-xs mt-1">
              Try adjusting your search
            </p>
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 ">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
