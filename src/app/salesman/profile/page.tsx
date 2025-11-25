"use client";

import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { User, DollarSign, TrendingUp, Package, LogOut, Calendar } from "lucide-react";

export default function ProfilePage() {
    const { user, logout } = useAuth();

    const { data: stats } = useQuery({
        queryKey: ["salesman_stats", user?.id],
        queryFn: async () => {
            if (!user?.id) return null;

            // Get total sales
            const { data: sales } = await supabase
                .from("sales")
                .select("total_revenue, cash_collected, total_profit, created_at")
                .eq("salesman_id", user.id);

            // Get today's sales
            const today = new Date().toISOString().split("T")[0];
            const todaysSales = sales?.filter(s =>
                s.created_at.startsWith(today)
            ) || [];

            // Get this month's sales
            const thisMonth = new Date().toISOString().slice(0, 7);
            const monthSales = sales?.filter(s =>
                s.created_at.startsWith(thisMonth)
            ) || [];

            return {
                totalSales: sales?.length || 0,
                totalRevenue: sales?.reduce((sum, s) => sum + s.total_revenue, 0) || 0,
                totalCash: sales?.reduce((sum, s) => sum + s.cash_collected, 0) || 0,
                totalProfit: sales?.reduce((sum, s) => sum + s.total_profit, 0) || 0,
                todaySales: todaysSales.length,
                todayRevenue: todaysSales.reduce((sum, s) => sum + s.total_revenue, 0),
                monthSales: monthSales.length,
                monthRevenue: monthSales.reduce((sum, s) => sum + s.total_revenue, 0),
            };
        },
        enabled: !!user?.id
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
                <h1 className="text-xl font-bold" style={{ color: "#3E2758" }}>Profile</h1>
                <p className="text-sm text-zinc-500">Your account and statistics</p>
            </div>

            {/* User Info Card */}
            <div className="bg-white rounded-xl border border-zinc-200 p-6">
                <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-full flex items-center justify-center" style={{ backgroundColor: "#3E2758" }}>
                        <User className="text-white" size={32} />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-bold" style={{ color: "#3E2758" }}>
                            {userDetails?.full_name || "User"}
                        </h2>
                        <p className="text-sm text-zinc-500">{user?.email}</p>
                        {userDetails?.phone_number && (
                            <p className="text-sm text-zinc-500 mt-1">📞 {userDetails.phone_number}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                            <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                                Salesman
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

            {/* Today's Performance */}
            <div className="bg-white rounded-xl border border-zinc-200 p-4">
                <h3 className="font-bold mb-3" style={{ color: "#3E2758" }}>Today's Performance</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-zinc-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="text-green-600" size={16} />
                            <p className="text-xs text-zinc-500">Sales</p>
                        </div>
                        <p className="text-xl font-bold" style={{ color: "#3E2758" }}>{stats?.todaySales || 0}</p>
                    </div>
                    <div className="p-3 bg-zinc-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="text-blue-600" size={16} />
                            <p className="text-xs text-zinc-500">Revenue</p>
                        </div>
                        <p className="text-xl font-bold" style={{ color: "#3E2758" }}>₹{stats?.todayRevenue?.toLocaleString() || 0}</p>
                    </div>
                </div>
            </div>

            {/* This Month */}
            <div className="bg-white rounded-xl border border-zinc-200 p-4">
                <h3 className="font-bold mb-3" style={{ color: "#3E2758" }}>This Month</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Calendar className="text-purple-600" size={20} />
                            <span className="text-sm text-zinc-600">Total Sales</span>
                        </div>
                        <span className="font-bold" style={{ color: "#3E2758" }}>{stats?.monthSales || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <DollarSign className="text-green-600" size={20} />
                            <span className="text-sm text-zinc-600">Revenue</span>
                        </div>
                        <span className="font-bold" style={{ color: "#3E2758" }}>₹{stats?.monthRevenue?.toLocaleString() || 0}</span>
                    </div>
                </div>
            </div>

            {/* All Time Stats */}
            <div className="bg-white rounded-xl border border-zinc-200 p-4">
                <h3 className="font-bold mb-3" style={{ color: "#3E2758" }}>All Time Statistics</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
                        <span className="text-sm text-zinc-600">Total Transactions</span>
                        <span className="font-bold" style={{ color: "#3E2758" }}>{stats?.totalSales || 0}</span>
                    </div>
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
    );
}
