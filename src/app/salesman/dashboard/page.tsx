"use client";

import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import {
    DollarSign,
    Package,
    TrendingUp,
    MapPin,
    Clock,
    AlertCircle
} from "lucide-react";

export default function SalesmanDashboard() {
    const { user, activeStorehouse } = useAuth();
    const [greeting, setGreeting] = useState("Good Morning");

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good Morning");
        else if (hour < 18) setGreeting("Good Afternoon");
        else setGreeting("Good Evening");
    }, []);

    const { data: trip } = useQuery({
        queryKey: ["todays_trip", user?.id],
        queryFn: async () => {
            if (!user?.id) return null;
            const { data } = await supabase
                .from("trips")
                .select(`
          *,
          route:routes(name)
        `)
                .eq("salesman_id", user.id)
                .eq("trip_date", new Date().toISOString().split("T")[0])
                .maybeSingle();
            return data;
        },
        enabled: !!user?.id
    });

    const { data: inventory } = useQuery({
        queryKey: ["salesman_inventory", activeStorehouse],
        queryFn: async () => {
            if (!activeStorehouse) return [];
            const { data } = await supabase
                .from("inventory")
                .select(`
          *,
          product:products(name, default_selling_price)
        `)
                .eq("storehouse_id", activeStorehouse)
                .gt("quantity", 0);
            return data || [];
        },
        enabled: !!activeStorehouse
    });

    const totalStockValue = inventory?.reduce((sum, item: any) => {
        return sum + (item.quantity * (item.product?.default_selling_price || 0));
    }, 0) || 0;

    const totalStockQty = inventory?.reduce((sum, item: any) => sum + item.quantity, 0) || 0;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: "#3E2758" }}>
                    {greeting}!
                </h1>
                <p className="text-zinc-500">
                    {user?.email?.split("@")[0] || "Salesman"}
                </p>
            </div>

            {trip ? (
                <div className="text-white p-6 rounded-2xl shadow-lg" style={{ backgroundColor: "#3E2758" }}>
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="opacity-70 text-sm mb-1">Today's Route</p>
                            <h2 className="text-2xl font-bold">{trip.route?.name || "No Route"}</h2>
                        </div>
                        <div className="p-3 rounded-xl" style={{ backgroundColor: "#FACC15" }}>
                            <MapPin size={24} style={{ color: "#3E2758" }} />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm opacity-90">
                        <Clock size={16} />
                        <span>Vehicle: {trip.vehicle_number || "Not assigned"}</span>
                    </div>
                </div>
            ) : (
                <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-zinc-300">
                    <div className="flex items-center gap-3 text-zinc-500">
                        <AlertCircle size={24} />
                        <div>
                            <p className="font-medium">No trip assigned today</p>
                            <p className="text-sm">Contact admin to get started</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: "#10B981" + "20" }}>
                            <DollarSign style={{ color: "#10B981" }} size={20} />
                        </div>
                        <p className="text-xs text-zinc-500">Cash in Hand</p>
                    </div>
                    <p className="text-2xl font-bold" style={{ color: "#3E2758" }}>₹0</p>
                    <p className="text-xs text-zinc-400 mt-1">No transactions yet</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: "#3B82F6" + "20" }}>
                            <Package style={{ color: "#3B82F6" }} size={20} />
                        </div>
                        <p className="text-xs text-zinc-500">Stock Qty</p>
                    </div>
                    <p className="text-2xl font-bold" style={{ color: "#3E2758" }}>{totalStockQty}</p>
                    <p className="text-xs text-zinc-400 mt-1">₹{totalStockValue.toLocaleString()} value</p>
                </div>
            </div>

            <div>
                <h3 className="text-sm font-medium text-zinc-500 mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                    <a
                        href="/salesman/pos"
                        className="bg-white p-4 rounded-xl border border-zinc-200 hover:border-zinc-300 transition-colors text-center"
                    >
                        <div className="h-12 w-12 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: "#3E2758" }}>
                            <TrendingUp className="text-white" size={24} />
                        </div>
                        <p className="text-sm font-medium" style={{ color: "#3E2758" }}>New Sale</p>
                    </a>

                    <a
                        href="/salesman/stocks"
                        className="bg-white p-4 rounded-xl border border-zinc-200 hover:border-zinc-300 transition-colors text-center"
                    >
                        <div className="h-12 w-12 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: "#FACC15" }}>
                            <Package style={{ color: "#3E2758" }} size={24} />
                        </div>
                        <p className="text-sm font-medium" style={{ color: "#3E2758" }}>View Stock</p>
                    </a>
                </div>
            </div>
        </div>
    );
}
