import Link from "next/link";
import { Dumbbell, ShieldCheck, Truck, Star, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero */}
      <section className="relative px-6 py-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-150 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-full px-4 py-1.5 mb-6">
            <Dumbbell className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-slate-300 text-xs font-medium">
              Premium gym equipment, delivered fast
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight">
            Build your home gym
            <br />
            <span className="text-orange-400">the right way</span>
          </h1>
          <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
            From dumbbells to resistance bands, find everything you need to
            train hard, anywhere.
          </p>
          <Link
            href="/pages/products"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-8 py-3.5 rounded-xl text-sm transition-colors"
          >
            Shop Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 border-y border-slate-900 bg-slate-900/30">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            {
              icon: Truck,
              title: "Free Shipping",
              desc: "On all orders across India",
            },
            {
              icon: ShieldCheck,
              title: "Secure Payments",
              desc: "Powered by Razorpay",
            },
            {
              icon: Star,
              title: "Quality Assured",
              desc: "Premium tested equipment",
            },
          ].map((f, i) => (
            <div key={i} className="text-center">
              <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center mx-auto mb-3">
                <f.icon className="w-5 h-5 text-orange-400" />
              </div>
              <h3 className="text-white font-semibold text-sm mb-1">
                {f.title}
              </h3>
              <p className="text-slate-500 text-xs">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">
          Ready to get started?
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          Browse our full collection of gym equipment.
        </p>
        <Link
          href="/pages/products"
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
        >
          Explore Products
        </Link>
      </section>
    </div>
  );
}
