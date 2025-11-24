"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, Store, Package, History } from "lucide-react";

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { name: "Home", href: "/", icon: Home },
        { name: "Route", href: "/route", icon: MapPin },
        { name: "POS", href: "/pos", icon: Store },
        { name: "Stock", href: "/stock", icon: Package },
        { name: "History", href: "/history", icon: History },
    ];

    if (pathname.startsWith("/admin") || pathname === "/login") return null;

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 pb-safe z-40">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive
                                    ? "text-violet-600 dark:text-violet-400"
                                    : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
                                }`}
                        >
                            <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
