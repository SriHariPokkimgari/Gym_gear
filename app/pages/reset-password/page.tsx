"use client";

import axios from "axios";
import { CheckCircle, Dumbbell, Lock, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link. Please request a new one.");
    }
  }, [token]);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Password do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/auth/reset-password", {
        token,
        password: formData.password,
      });
      setSuccess(true);
      setTimeout(() => router.push("/pages/login"), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-3">
            <Dumbbell className="w-10 h-10 text-orange-500" />
            <h1 className="text-white text-3xl font-bold tracking-tight">
              GymGear
            </h1>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8">
          {success ? (
            // Success state
            <div className="text-center">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-emerald-400" />
              </div>
              <h2 className="text-white text-xl font-bold mb-2">
                Password reset!
              </h2>
              <p className="text-slate-400 text-sm mb-2">
                Your password has been updated successfully.
              </p>
              <p className="text-slate-500 text-xs mb-6">
                Redirecting to login in 3 seconds...
              </p>
              <Link
                href="/pages/login"
                className="text-orange-400 hover:text-orange-300 text-sm transition-colors"
              >
                Go to login →
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-white text-xl font-bold mb-1">
                  Reset password
                </h2>
                <p className="text-slate-400 text-sm">
                  Enter your new password below.
                </p>
              </div>

              {error && (
                <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="Minimum 6 characters"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="Repeat your new password"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !token}
                  className="w-full bg-orange-500 hover:bg-orange-400 disabled:bg-orange-500/50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={`<div className="min-h-screen bg-slate-950" />`}>
      <ResetPasswordContent />
    </Suspense>
  );
}
