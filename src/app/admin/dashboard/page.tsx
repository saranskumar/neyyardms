"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
    TrendingUp,
    DollarSign,
    Package,
    AlertTriangle,
    Truck,
    Users,
    ArrowUp,
    ArrowDown
} from "lucide-react";

export default function AdminDashboard() {
    const { data: dailyFlow } = useQuery({
        queryKey: ["daily_flow_today"],
        queryFn: async () => {
            const { data } = await supabase
                .from("view_daily_flow_today")
                .select("*")
                .single();
            return data;
        }
    });

    const { data: activeTrips } = useQuery({
        queryKey: ["active_trips"],
        queryFn: async () => {
            const { data } = await supabase
                .from("trips")
                .select(`
          *,
          salesman:users!trips_salesman_id_fkey(full_name),
          route:routes(name)
        `)
                .eq("status", "active")
                .order("trip_date", { ascending: false });
            return data || [];
        }
    });

    const revenue = dailyFlow?.sold_today_value || 0;
    const damaged = dailyFlow?.damaged_today_value || 0;
    const currentStock = dailyFlow?.current_stock_value || 0;

    const kpiCards = [
        {
            title: "Today's Revenue",
            value: `₹${revenue.toLocaleString()}`,
            icon: TrendingUp,
            color: "#10B981",
            trend: "+12%",
            trendUp: true
        },
        {
            title: "Current Stock Value",
            value: `₹${currentStock.toLocaleString()}`,
            icon: Package,
            color: "#3B82F6",
            trend: `${dailyFlow?.current_stock_qty || 0} items`,
            trendUp: null
        },
        {
            title: "Damaged Today",
            value: `₹${damaged.toLocaleString()}`,
            icon: AlertTriangle,
            color: "#EF4444",
            trend: `${dailyFlow?.damaged_today_qty || 0} items`,
            trendUp: false
        },
        {
            title: "Active Trips",
            value: activeTrips?.length || 0,
            icon: Truck,
            color: "#3E2758",
            trend: "In progress",
            trendUp: null
        }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold" style={{ color: "#3E2758" }}>Dashboard</h1>
                <p className="text-zinc-500 mt-1">Welcome back! Here's what's happening today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiCards.map((card, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-xl" style={{ backgroundColor: card.color + "20" }}>
                                <card.icon style={{ color: card.color }} size={24} />
                            </div>
                            {card.trendUp !== null && (
                                <div className={`flex items-center gap-1 text-sm ${card.trendUp ? "text-green-600" : "text-red-600"
                                    }`}>
                                    {card.trendUp ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                                    {card.trend}
                                </div>
                            )}
                        </div>
                        <h3 className="text-sm font-medium text-zinc-500">
                            {card.title}
                        </h3>
                        <p className="text-3xl font-bold mt-2" style={{ color: "#3E2758" }}>
                            {card.value}
                        </p>
                        {card.trendUp === null && (
                            <p className="text-xs text-zinc-400 mt-2">{card.trend}</p>
                        )}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                    <h2 className="text-lg font-bold mb-4" style={{ color: "#3E2758" }}>
                        Stock Flow Today
                    </h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-zinc-600">Incoming</span>
                            <span className="font-bold text-green-600">
                                +{dailyFlow?.incoming_today_qty || 0} items
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-zinc-600">Sold</span>
                            <span className="font-bold text-blue-600">
                                -{dailyFlow?.sold_today_qty || 0} items
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-zinc-600">Damaged</span>
                            <span className="font-bold text-red-600">
                                -{dailyFlow?.damaged_today_qty || 0} items
                            </span>
                        </div>
                        <div className="pt-4 border-t border-zinc-200">
                            <div className="flex justify-between items-center">
                                <span className="font-medium" style={{ color: "#3E2758" }}>Net Change</span>
                                <span className="font-bold text-lg" style={{ color: "#3E2758" }}>
                                    {((dailyFlow?.incoming_today_qty || 0) -
                                        (dailyFlow?.sold_today_qty || 0) -
                                        (dailyFlow?.damaged_today_qty || 0))} items
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                    <h2 className="text-lg font-bold mb-4" style={{ color: "#3E2758" }}>
                        Active Trips
                    </h2>
                    {activeTrips && activeTrips.length > 0 ? (
                        <div className="space-y-3">
                            {activeTrips.slice(0, 5).map((trip: any) => (
                                <div
                                    key={trip.id}
                                    className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "#3E2758" + "20" }}>
                                            <Truck size={18} style={{ color: "#3E2758" }} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm" style={{ color: "#3E2758" }}>
                                                {trip.salesman?.full_name || "Unknown"}
                                            </p>
                                            <p className="text-xs text-zinc-500">
                                                {trip.route?.name || "No route"}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "#10B981" + "20", color: "#10B981" }}>
                                        Active
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-zinc-400 text-sm">No active trips today</p>
                    )}
                </div>
            </div>
        </div>
    );
}
