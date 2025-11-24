"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, ReactNode, useState } from "react";
import Link from "next/link";
import {
    LayoutDashboard,
    Package,
    Truck,
    Store,
    Users,
    BarChart3,
    LogOut,
    ShoppingBag,
    MapPin,
    Menu,
    X
} from "lucide-react";
import Image from "next/image";

export default function AdminLayout({ children }: { children: ReactNode }) {
    const { role, loading, logout, user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

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
        { name: "Trips", href: "/admin/trips", icon: Truck },
        { name: "Routes", href: "/admin/routes", icon: MapPin },
        { name: "Products", href: "/admin/products", icon: ShoppingBag },
        { name: "Shops", href: "/admin/shops", icon: Store },
        { name: "Sales", href: "/admin/sales", icon: BarChart3 },
        { name: "Users", href: "/admin/users", icon: Users },
    ];

    if (loading || !user || role !== "admin") {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F3F4F6" }}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: "#3E2758" }}></div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen" style={{ backgroundColor: "#F3F4F6" }}>
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:flex w-64 text-white flex-col fixed h-screen" style={{ backgroundColor: "#3E2758" }}>
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <Image
                            src="/icons/icon-192.png"
                            alt="Neyyar"
                            width={40}
                            height={40}
                            className="rounded-lg"
                        />
                        <div>
                            <h1 className="font-bold text-lg tracking-tight">Neyyar Dairy</h1>
                            <p className="text-xs opacity-70">Admin Portal</p>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                            ? "bg-white font-semibold shadow-lg"
                                            : "hover:bg-white/10"
                                        }`}
                                    style={isActive ? { color: "#3E2758" } : {}}
                                >
                                    <item.icon size={20} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center">
                            <Users size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user?.email}</p>
                            <p className="text-xs opacity-70">Administrator</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 hover:text-white transition-colors w-full px-4 py-2 rounded-lg hover:bg-white/10"
                        style={{ color: "#FACC15" }}
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar */}
            {sidebarOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <aside className="fixed left-0 top-0 bottom-0 w-64 text-white z-50 lg:hidden" style={{ backgroundColor: "#3E2758" }}>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <Image
                                        src="/icons/icon-192.png"
                                        alt="Neyyar"
                                        width={40}
                                        height={40}
                                        className="rounded-lg"
                                    />
                                    <div>
                                        <h1 className="font-bold text-lg">Neyyar Dairy</h1>
                                        <p className="text-xs opacity-70">Admin</p>
                                    </div>
                                </div>
                                <button onClick={() => setSidebarOpen(false)}>
                                    <X size={24} />
                                </button>
                            </div>

                            <nav className="space-y-1">
                                {navItems.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                                    ? "bg-white font-semibold"
                                                    : "hover:bg-white/10"
                                                }`}
                                            style={isActive ? { color: "#3E2758" } : {}}
                                        >
                                            <item.icon size={20} />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    </aside>
                </>
            )}

            {/* Main Content */}
            <div className="flex-1 lg:ml-64">
                <header className="lg:hidden bg-white border-b border-zinc-200 p-4 flex items-center justify-between sticky top-0 z-30">
                    <button onClick={() => setSidebarOpen(true)}>
                        <Menu size={24} style={{ color: "#3E2758" }} />
                    </button>
                    <h1 className="font-bold" style={{ color: "#3E2758" }}>Neyyar Admin</h1>
                    <div className="w-6" />
                </header>

                <main className="p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
