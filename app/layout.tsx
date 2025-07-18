import { Geist, Geist_Mono } from "next/font/google";
import { Component } from "@/type/component";
import { PropsWithChildren } from "react";
import type { Metadata } from "next";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Supa Clicker",
  description: "A simple clicker game built with Next.js and Tailwind CSS for the Supabase Hackathon of LW15.",
};

const RootLayout: Component<PropsWithChildren> = ({ children }) => {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0a] text-white relative`}>
        <div className="pointer-events-none absolute inset-0 z-0 bg-[url('/noise.svg')] opacity-10 mix-blend-screen h-screen" />
        
        <main className="relative z-10 p-8">
          {children}
        </main>
      </body>
    </html>
  );
};

export default RootLayout;