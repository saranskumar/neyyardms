"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Edit, X, TrendingUp, Calendar, DollarSign } from "lucide-react";
import { toast } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Shop {
    id: number;
    name: string;
    image_url: string | null;
    current_balance: number;
    price_overrides: Record<string, number>;
    route_id: number | null;
    route_order: number | null;
    is_active: boolean;
}

interface Route {
    id: number;
    name: string;
}

export default function ShopDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const shopId = parseInt(params.id);
    const queryClient = useQueryClient();
    const [editingBalance, setEditingBalance] = useState(false);
    const [newBalance, setNewBalance] = useState(0);

    const { data: shop, isLoading } = useQuery({
        queryKey: ["shop", shopId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("shops")
                .select("*")
                .eq("id", shopId)
                .single();
            if (error) throw error;
            setNewBalance(data.current_balance);
            return data as Shop;
        }
    });

    const { data: routes } = useQuery({
        queryKey: ["routes"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("routes")
                .select("*")
                .order("name");
            if (error) throw error;
            return data as Route[];
        }
    });

    const { data: recentSales } = useQuery({
        queryKey: ["shop_sales", shopId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("sales")
                .select("*")
                .eq("shop_id", shopId)
                .order("created_at", { ascending: false })
                .limit(10);
            if (error) throw error;
            return data;
        }
    });

    const updateMutation = useMutation({
        mutationFn: async (balance: number) => {
            const { error } = await supabase
                .from("shops")
                .update({ current_balance: balance })
                .eq("id", shopId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shop", shopId] });
            queryClient.invalidateQueries({ queryKey: ["shops"] });
            toast("Balance updated successfully");
            setEditingBalance(false);
        },
        onError: (error: any) => {
            toast(error.message || "Failed to update balance");
        }
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: "#3E2758" }}></div>
            </div>
        );
    }

    if (!shop) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p className="text-zinc-500 mb-4">Shop not found</p>
                <button
                    onClick={() => router.push("/admin/shops")}
                    className="px-4 py-2 rounded-lg text-white font-medium"
                    style={{ backgroundColor: "#3E2758" }}
                >
                    Back to Shops
                </button>
            </div>
        );
    }

    const route = routes?.find(r => r.id === shop.route_id);

    return (
        <div className="min-h-screen bg-zinc-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <button
                    onClick={() => router.push("/admin/shops")}
                    className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 mb-6"
                >
                    <ArrowLeft size={20} />
                    Back to Shops
                </button>

                <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold" style={{ color: "#3E2758" }}>{shop.name}</h1>
                            <p className="text-sm text-zinc-500 mt-1">Shop ID: {shop.id}</p>
                        </div>
                        <button
                            onClick={() => router.push(`/admin/shops?edit=${shop.id}`)}
                            className="p-2 hover:bg-zinc-100 rounded-lg"
                        >
                            <Edit size={20} style={{ color: "#3E2758" }} />
                        </button>
                    </div>

                    {/* Shop Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-zinc-50 rounded-xl p-4">
                            <p className="text-sm text-zinc-500 mb-1">Route</p>
                            <p className="font-bold" style={{ color: "#3E2758" }}>
                                {route?.name || "Not assigned"}
                            </p>
                        </div>
                        <div className="bg-zinc-50 rounded-xl p-4">
                            <p className="text-sm text-zinc-500 mb-1">Route Order</p>
                            <p className="font-bold" style={{ color: "#3E2758" }}>
                                {shop.route_order || "-"}
                            </p>
                        </div>
                        <div className="bg-zinc-50 rounded-xl p-4">
                            <p className="text-sm text-zinc-500 mb-1">Status</p>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${shop.is_active ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-600"
                                }`}>
                                {shop.is_active ? "Active" : "Inactive"}
                            </span>
                        </div>
                    </div>

                    {/* Outstanding Balance */}
                    <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-lg" style={{ color: "#3E2758" }}>Outstanding Balance</h3>
                            <button
                                onClick={() => setEditingBalance(!editingBalance)}
                                className="text-sm px-3 py-1.5 rounded-lg font-medium hover:bg-white/50"
                                style={{ color: "#3E2758" }}
                            >
                                {editingBalance ? "Cancel" : "Edit"}
                            </button>
                        </div>
                        {editingBalance ? (
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    step="0.01"
                                    value={newBalance}
                                    onChange={(e) => setNewBalance(parseFloat(e.target.value) || 0)}
                                    className="flex-1 border-2 border-violet-300 rounded-lg px-3 py-2 outline-none focus:border-violet-500"
                                />
                                <button
                                    onClick={() => updateMutation.mutate(newBalance)}
                                    className="px-6 py-2 rounded-lg text-white font-medium hover:opacity-90"
                                    style={{ backgroundColor: "#3E2758" }}
                                >
                                    Save
                                </button>
                            </div>
                        ) : (
                            <p className={`text-4xl font-bold ${shop.current_balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                ₹{shop.current_balance.toLocaleString()}
                            </p>
                        )}
                        <p className="text-sm text-zinc-600 mt-2">
                            {shop.current_balance > 0 ? "🔴 Shop owes money" : shop.current_balance < 0 ? "🟢 Credit balance" : "⚪ Balanced"}
                        </p>
                    </div>
                </div>

                {/* Recent Sales */}
                <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                    <h3 className="font-bold text-lg mb-4" style={{ color: "#3E2758" }}>Recent Sales</h3>
                    {recentSales && recentSales.length > 0 ? (
                        <div className="space-y-3">
                            {recentSales.map((sale: any) => (
                                <div key={sale.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition-colors">
                                    <div>
                                        <p className="font-medium" style={{ color: "#3E2758" }}>
                                            Sale #{sale.id}
                                        </p>
                                        <p className="text-sm text-zinc-500 mt-1">
                                            {new Date(sale.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold" style={{ color: "#3E2758" }}>
                                            ₹{sale.total_revenue.toFixed(2)}
                                        </p>
                                        <p className="text-xs text-zinc-500 mt-1">
                                            Cash: ₹{sale.cash_collected.toFixed(2)} | Credit: ₹{sale.outstanding_added.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <TrendingUp className="mx-auto mb-3 text-zinc-300" size={48} />
                            <p className="text-zinc-500">No sales history yet</p>
                            <p className="text-sm text-zinc-400 mt-1">Sales will appear here once transactions are made</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
