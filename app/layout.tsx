import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ClientWrapper from "@/components/ClientWrapper";
import { ToastProvider } from "@/components/ToastProvider";
import { ReactNode } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Unity Assets Marketplace",
  description: "Browse, preview, and download high-quality Unity assets. Subscribe for unlimited access!",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Unity Assets Marketplace</title>
        <meta name="description" content="Browse, preview, and download high-quality Unity assets. Subscribe for unlimited access!" />
      </head>
      <body className="min-h-screen flex flex-col">
        <ClientWrapper>
          <Header />
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <Footer />
          <ToastProvider />
        </ClientWrapper>
      </body>
    </html>
  );
}
