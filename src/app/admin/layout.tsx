"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    LayoutDashboard,
    Package,
    Store,
    Truck,
    User
} from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
    const { role, loading, user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        } else if (!loading && role && role !== "admin") {
            router.push("/salesman/dashboard");
        }
    }, [role, loading, user, router]);

    const navItems = [
        { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { name: "Inventory", href: "/admin/inventory", icon: Package },
        { name: "Shops", href: "/admin/shops", icon: Store },
        { name: "Logistics", href: "/admin/logistics", icon: Truck },
        { name: "Profile", href: "/admin/profile", icon: User },
    ];

    if (loading || !user || role !== "admin") {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F3F4F6" }}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: "#3E2758" }}></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20" style={{ backgroundColor: "#F3F4F6" }}>
            <header className="text-white p-4 sticky top-0 z-30 shadow-lg" style={{ backgroundColor: "#3E2758" }}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Image
                            src="/icons/icon-192.png"
                            alt="Neyyar"
                            width={32}
                            height={32}
                            className="rounded-lg"
                        />
                        <div>
                            <h1 className="font-bold text-base">Neyyar Dairy</h1>
                            <p className="text-xs opacity-70">Admin Portal</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="p-4 md:p-6">
                {children}
            </main>

            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 z-40">
                <div className="flex justify-around items-center h-16">
                    {navItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors"
                                style={{ color: isActive ? "#3E2758" : "#9CA3AF" }}
                            >
                                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-[10px] font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
