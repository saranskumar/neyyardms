"use client";

import { useEffect, useState } from "react";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import QueryProvider from "@/providers/QueryProvider";
import { AuthProvider } from "@/lib/auth-context";
import { usePathname } from "next/navigation";
import InstallPrompt from "@/components/InstallPrompt";
import { Wifi, WifiOff } from "lucide-react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then((registration) => {
        console.log("Service Worker registered:", registration);
      }).catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
    }

    // Online/Offline detection
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineBanner(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineBanner(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check
    setIsOnline(navigator.onLine);
    if (!navigator.onLine) {
      setShowOfflineBanner(true);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#3E2758" />
        <meta name="description" content="Complete dairy management system for sales, inventory, and route management" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="pb-16">
        {/* Offline Banner */}
        {showOfflineBanner && (
          <div
            className="fixed top-0 left-0 right-0 z-50 px-4 py-2 text-white text-center text-sm flex items-center justify-center gap-2"
            style={{ backgroundColor: "#ff6b6b" }}
          >
            <WifiOff size={16} />
            <span>You're offline. Changes will sync when back online.</span>
          </div>
        )}

        {/* Online indicator (subtle) */}
        {!showOfflineBanner && !isOnline && (
          <div
            className="fixed top-0 left-0 right-0 z-50 px-4 py-2 text-white text-center text-sm flex items-center justify-center gap-2"
            style={{ backgroundColor: "#51cf66" }}
          >
            <Wifi size={16} />
            <span>Back online!</span>
          </div>
        )}

        <AuthProvider>
          <QueryProvider>
            {children}
            <BottomNav />
            <InstallPrompt />
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
