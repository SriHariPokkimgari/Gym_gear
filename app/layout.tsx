import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import NavBar from "@/components/Navbar";
import ChatWidget from "@/components/ChatWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GymGear",
  description: "Your ultimate gym utilities store",
  openGraph: {
    title: "GymGear",
    description: "An e-commerce store for gym buddies with AI assistent",
    url: "https://gym-gear.vercel.app/",
    siteName: "GymGear",
    images: [
      {
        url: "../public/og.png",
        width: 1200,
        height: 600,
        alt: "open graph",
      },
    ],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <CartProvider>
            <NavBar />
            {children}
            <ChatWidget />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
