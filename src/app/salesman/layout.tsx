"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, ReactNode, useState } from "react";
import Link from "next/link";
import { Home, MapPin, Store, Package, History, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

export default function SalesmanLayout({ children }: { children: ReactNode }) {
    const { role, loading, activeStorehouse, setActiveStorehouse, defaultStorehouse, user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [showStorehouseMenu, setShowStorehouseMenu] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        } else if (!loading && role && role !== "salesman") {
            router.push("/admin/dashboard");
        }
    }, [role, loading, user, router]);

    const { data: storehouses } = useQuery({
        queryKey: ["storehouses"],
        queryFn: async () => {
            const { data } = await supabase
                .from("storehouses")
                .select("*")
                .order("name");
            return data || [];
        }
    });

    const currentStorehouse = storehouses?.find(s => s.id === activeStorehouse);

    const navItems = [
        { name: "Home", href: "/salesman/dashboard", icon: Home },
        { name: "Route", href: "/salesman/route", icon: MapPin },
        { name: "POS", href: "/salesman/pos", icon: Store },
        { name: "Stock", href: "/salesman/stocks", icon: Package },
        { name: "History", href: "/salesman/history", icon: History },
    ];

    if (loading || !user || role !== "salesman") {
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
                            <p className="text-xs opacity-70">Salesman Portal</p>
                        </div>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowStorehouseMenu(!showStorehouseMenu)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
                            style={{ backgroundColor: "#FACC15", color: "#3E2758" }}
                        >
                            <Package size={16} />
                            <span className="text-sm font-medium">
                                {currentStorehouse?.name || "Select"}
                            </span>
                            <ChevronDown size={16} />
                        </button>

                        {showStorehouseMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowStorehouseMenu(false)}
                                />
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-zinc-200 overflow-hidden z-50">
                                    {storehouses?.map((storehouse: any) => (
                                        <button
                                            key={storehouse.id}
                                            onClick={() => {
                                                setActiveStorehouse(storehouse.id);
                                                setShowStorehouseMenu(false);
                                            }}
                                            className={`w-full text-left px-4 py-3 hover:bg-zinc-50 transition-colors ${activeStorehouse === storehouse.id
                                                    ? "font-medium"
                                                    : "text-zinc-900"
                                                }`}
                                            style={activeStorehouse === storehouse.id ? {
                                                backgroundColor: "#FEF3C7",
                                                color: "#3E2758"
                                            } : {}}
                                        >
                                            {storehouse.name}
                                            {defaultStorehouse === storehouse.id && (
                                                <span className="text-xs text-zinc-500 ml-2">(Default)</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className="p-4">
                {children}
            </main>

            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 z-40">
                <div className="flex justify-around items-center h-16">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
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
