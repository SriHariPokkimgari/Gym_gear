"use client";

import Link from "next/link";
import { ShoppingCart, Package } from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();

  const fmt = (price: number) =>
    `₹${price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  return (
    <div className="group bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden transition-all hover:-translate-y-1">
      {/* Image */}
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-slate-800">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-12 h-12 text-slate-600" />
            </div>
          )}

          {/* Out of stock badge */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                Out of Stock
              </span>
            </div>
          )}

          {/* Category badge */}
          {product.category_name && (
            <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-slate-300 text-xs px-2.5 py-1 rounded-full">
              {product.category_name}
            </div>
          )}
        </div>
      </Link>

      {/* Details */}
      <div className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="text-white font-semibold text-sm mb-1 hover:text-orange-400 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <p className="text-slate-500 text-xs mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <p className="text-orange-400 font-bold">{fmt(product.price)}</p>
          <button
            onClick={() => addToCart(product)}
            disabled={product.stock === 0}
            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-400 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
