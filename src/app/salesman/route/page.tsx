"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Store, MapPin, TrendingUp, Calendar } from "lucide-react";
import Link from "next/link";

interface Shop {
    id: number;
    name: string;
    image_url: string | null;
    route_order: number | null;
    current_balance: number;
    last_sale_date: string | null;
}

export default function RoutePage() {
    const { data: shops, isLoading } = useQuery({
        queryKey: ["route_shops"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("view_shop_debt")
                .select("*");
            if (error) throw error;
            return data as Shop[];
        }
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <MapPin style={{ color: "#3E2758" }} size={28} />
                <div>
                    <h1 className="text-xl font-bold" style={{ color: "#3E2758" }}>Today's Route</h1>
                    <p className="text-sm text-zinc-500">{shops?.length || 0} shops</p>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: "#3E2758" }}></div>
                </div>
            ) : shops && shops.length > 0 ? (
                <div className="space-y-3">
                    {shops.map((shop) => (
                        <Link
                            key={shop.id}
                            href={`/salesman/shop/${shop.id}`}
                            className="block bg-white rounded-xl border border-zinc-200 p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3 flex-1">
                                    {shop.route_order && (
                                        <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: "#3E2758", color: "white" }}>
                                            {shop.route_order}
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-bold" style={{ color: "#3E2758" }}>{shop.name}</h3>
                                        <div className="flex items-center gap-4 mt-2">
                                            <div className="flex items-center gap-1 text-sm">
                                                <TrendingUp size={14} className={shop.current_balance > 0 ? "text-red-600" : "text-green-600"} />
                                                <span className={shop.current_balance > 0 ? "text-red-600 font-medium" : "text-green-600"}>
                                                    ₹{Math.abs(shop.current_balance).toLocaleString()}
                                                </span>
                                            </div>
                                            {shop.last_sale_date && (
                                                <div className="flex items-center gap-1 text-sm text-zinc-500">
                                                    <Calendar size={14} />
                                                    <span>{new Date(shop.last_sale_date).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-2 rounded-lg" style={{ backgroundColor: "#F3F4F6" }}>
                                    <Store size={20} style={{ color: "#3E2758" }} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-xl border border-zinc-200">
                    <Store className="mx-auto mb-4 text-zinc-300" size={48} />
                    <p className="text-zinc-500">No shops in route</p>
                </div>
            )}
        </div>
    );
}
