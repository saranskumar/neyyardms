"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { User, BarChart3, Users as UsersIcon, LogOut, DollarSign, TrendingUp } from "lucide-react";

// Import sub-pages as components
const SalesContent = () => {
    const SalesPage = require("../sales/page").default;
    return <SalesPage />;
};

const UsersContent = () => {
    const UsersPage = require("../users/page").default;
    return <UsersPage />;
};

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<"personal" | "sales" | "users">("personal");

    const { data: stats } = useQuery({
        queryKey: ["admin_stats"],
        queryFn: async () => {
            const { data: sales } = await supabase
                .from("sales")
                .select("total_revenue, cash_collected, total_profit");

            const today = new Date().toISOString().split("T")[0];
            const { data: todaySales } = await supabase
                .from("sales")
                .select("total_revenue")
                .gte("created_at", `${today}T00:00:00`)
                .lte("created_at", `${today}T23:59:59`);

            return {
                totalSales: sales?.length || 0,
                totalRevenue: sales?.reduce((sum, s) => sum + s.total_revenue, 0) || 0,
                totalCash: sales?.reduce((sum, s) => sum + s.cash_collected, 0) || 0,
                totalProfit: sales?.reduce((sum, s) => sum + s.total_profit, 0) || 0,
                todayRevenue: todaySales?.reduce((sum, s) => sum + s.total_revenue, 0) || 0,
            };
        }
    });

    const { data: userDetails } = useQuery({
        queryKey: ["user_details", user?.id],
        queryFn: async () => {
            if (!user?.id) return null;
            const { data } = await supabase
                .from("users")
                .select("*")
                .eq("id", user.id)
                .single();
            return data;
        },
        enabled: !!user?.id
    });

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: "#3E2758" }}>Profile & Management</h1>
                <p className="text-zinc-500">Account settings and system management</p>
            </div>

            {/* Swipeable Tabs */}
            <div className="flex gap-2 bg-white rounded-xl border border-zinc-200 p-1">
                <button
                    onClick={() => setActiveTab("personal")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "personal"
                            ? "text-white"
                            : "text-zinc-600 hover:bg-zinc-50"
                        }`}
                    style={activeTab === "personal" ? { backgroundColor: "#3E2758" } : {}}
                >
                    <User size={18} />
                    Personal
                </button>
                <button
                    onClick={() => setActiveTab("sales")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "sales"
                            ? "text-white"
                            : "text-zinc-600 hover:bg-zinc-50"
                        }`}
                    style={activeTab === "sales" ? { backgroundColor: "#3E2758" } : {}}
                >
                    <BarChart3 size={18} />
                    Sales
                </button>
                <button
                    onClick={() => setActiveTab("users")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "users"
                            ? "text-white"
                            : "text-zinc-600 hover:bg-zinc-50"
                        }`}
                    style={activeTab === "users" ? { backgroundColor: "#3E2758" } : {}}
                >
                    <UsersIcon size={18} />
                    Users
                </button>
            </div>

            {/* Content */}
            {activeTab === "personal" && (
                <div className="space-y-4">
                    {/* User Info Card */}
                    <div className="bg-white rounded-xl border border-zinc-200 p-6">
                        <div className="flex items-start gap-4">
                            <div className="h-16 w-16 rounded-full flex items-center justify-center" style={{ backgroundColor: "#3E2758" }}>
                                <User className="text-white" size={32} />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-lg font-bold" style={{ color: "#3E2758" }}>
                                    {userDetails?.full_name || "Admin User"}
                                </h2>
                                <p className="text-sm text-zinc-500">{user?.email}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
                                        Administrator
                                    </span>
                                    {userDetails?.created_at && (
                                        <span className="text-xs text-zinc-400">
                                            Joined {new Date(userDetails.created_at).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* System Overview */}
                    <div className="bg-white rounded-xl border border-zinc-200 p-4">
                        <h3 className="font-bold mb-3" style={{ color: "#3E2758" }}>System Overview</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-zinc-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <DollarSign className="text-green-600" size={16} />
                                    <p className="text-xs text-zinc-500">Today's Revenue</p>
                                </div>
                                <p className="text-xl font-bold" style={{ color: "#3E2758" }}>₹{stats?.todayRevenue?.toLocaleString() || 0}</p>
                            </div>
                            <div className="p-3 bg-zinc-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <BarChart3 className="text-blue-600" size={16} />
                                    <p className="text-xs text-zinc-500">Total Sales</p>
                                </div>
                                <p className="text-xl font-bold" style={{ color: "#3E2758" }}>{stats?.totalSales || 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* All Time Stats */}
                    <div className="bg-white rounded-xl border border-zinc-200 p-4">
                        <h3 className="font-bold mb-3" style={{ color: "#3E2758" }}>All Time Statistics</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
                                <span className="text-sm text-zinc-600">Total Revenue</span>
                                <span className="font-bold text-green-600">₹{stats?.totalRevenue?.toLocaleString() || 0}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
                                <span className="text-sm text-zinc-600">Cash Collected</span>
                                <span className="font-bold text-blue-600">₹{stats?.totalCash?.toLocaleString() || 0}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
                                <span className="text-sm text-zinc-600">Total Profit</span>
                                <span className="font-bold text-purple-600">₹{stats?.totalProfit?.toLocaleString() || 0}</span>
                            </div>
                        </div>
                    </div>

                    {/* Sign Out Button */}
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 p-4 bg-white rounded-xl border border-red-200 text-red-600 font-medium hover:bg-red-50 transition-colors"
                    >
                        <LogOut size={20} />
                        Sign Out
                    </button>
                </div>
            )}

            {activeTab === "sales" && <SalesContent />}
            {activeTab === "users" && <UsersContent />}
        </div>
    );
}
