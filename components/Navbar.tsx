"use client";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Dumbbell, LogOut, ShoppingCart, User } from "lucide-react";

const NavBar = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const { totalItems } = useCart();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/pages/login");
  };
  return (
    <nav className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="text-white max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Dumbbell className="w-7 h-7 text-orange-500" />
          <span className=" font-bold text-lg tracking-tight ">GymGear</span>
        </Link>

        {/* Nav links */}
        <div className="hidden sm:flex items-center gap-6">
          <Link
            href="/pages/products"
            className="text-slate-400 hover:text-white text-sm transition-colors"
          >
            Products
          </Link>
          {user?.role === "admin" && (
            <Link
              href="/pages/admin"
              className="text-orange-400 hover:text-orange-300 text-sm transition-colors"
            >
              Admin
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Cart */}
          <Link
            href="/pages/cart"
            className="relative p-2 text-slate-400 hover:text-white transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </Link>

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors "
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          ) : (
            <Link
              href="/pages/login"
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              <User className="w-4 h-4" />
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
