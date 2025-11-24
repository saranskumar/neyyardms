"use client";

import { useEffect } from "react";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import QueryProvider from "@/providers/QueryProvider";
import { AuthProvider } from "@/lib/auth-context";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");
    }
  }, []);

  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#3E2758" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="pb-16">
        <AuthProvider>
          <QueryProvider>
            {children}
            <BottomNav />
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
