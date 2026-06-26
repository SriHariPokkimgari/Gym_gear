"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Dumbbell, ShoppingCart, User, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

const Navbar = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const { totalItems } = useCart();
  const router = useRouter();
  const pathName = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("");

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    router.push("/login");
  };

  useEffect(() => {
    if (pathName.split("/")[1] === "products") {
      setActiveTab("products");
    } else if (pathName.split("/")[1] === "login") {
      setActiveTab("");
    } else if (pathName.split("/")[1] === "cart") {
      setActiveTab("");
    }
  }, [pathName]);

  const navLinkClass = (tab: string) =>
    `text-slate-400 hover:text-white text-sm transition-colors ${
      activeTab === tab ? "border-b-2 border-orange-500 text-white" : ""
    }`;

  const mobileLinkClass = (tab: string) =>
    `block w-full px-4 py-3 rounded-xl text-sm transition-colors ${
      activeTab === tab
        ? "bg-orange-500/10 text-orange-400 font-medium"
        : "text-slate-400 hover:bg-slate-800 hover:text-white"
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          onClick={() => setActiveTab("home")}
          className="flex items-center gap-2.5"
        >
          <Dumbbell className="w-7 h-7 text-orange-500" />
          <span className="text-white font-bold text-lg tracking-tight">
            GymGear
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden sm:flex items-center gap-6">
          <Link
            href="/"
            className={navLinkClass("home")}
            onClick={() => setActiveTab("home")}
          >
            Home
          </Link>
          <Link
            href="/products"
            className={navLinkClass("products")}
            onClick={() => setActiveTab("products")}
          >
            Products
          </Link>
          {user?.role === "admin" && (
            <Link
              href="/admin"
              className={navLinkClass("admin")}
              onClick={() => setActiveTab("admin")}
            >
              Admin
            </Link>
          )}
          {isLoggedIn && (
            <Link
              href="/orders"
              className={navLinkClass("orders")}
              onClick={() => setActiveTab("orders")}
            >
              Orders
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Cart */}
          <Link
            href="/cart"
            className="relative p-2 text-slate-400 hover:text-white transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Desktop auth button */}
          <div className="hidden sm:block">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                <User className="w-4 h-4" />
                Sign in
              </Link>
            )}
          </div>

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 text-slate-400 hover:text-white transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-800 px-4 py-3 space-y-1 bg-slate-950">
          <Link
            href="/"
            className={mobileLinkClass("home")}
            onClick={() => {
              setActiveTab("home");
              setMobileMenuOpen(false);
            }}
          >
            Home
          </Link>
          <Link
            href="/products"
            className={mobileLinkClass("products")}
            onClick={() => {
              setActiveTab("products");
              setMobileMenuOpen(false);
            }}
          >
            Products
          </Link>

          {user?.role === "admin" && (
            <Link
              href="/admin"
              className={mobileLinkClass("admin")}
              onClick={() => {
                setActiveTab("admin");
                setMobileMenuOpen(false);
              }}
            >
              Admin
            </Link>
          )}

          {isLoggedIn && (
            <Link
              href="/orders"
              className={mobileLinkClass("orders")}
              onClick={() => {
                setActiveTab("orders");
                setMobileMenuOpen(false);
              }}
            >
              Orders
            </Link>
          )}

          {/* Auth action inside mobile menu */}
          <div className="pt-2 border-t border-slate-800 mt-2">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold px-4 py-3 rounded-xl transition-colors"
              >
                <User className="w-4 h-4" />
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
