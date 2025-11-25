"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Package, TrendingUp, Plus } from "lucide-react";

export default function StockContent() {
    const [selectedStorehouse, setSelectedStorehouse] = useState<1 | 2>(1);

    const { data: inventory, isLoading } = useQuery({
        queryKey: ["inventory", selectedStorehouse],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("inventory")
                .select(`
          *,
          product:products(name, default_selling_price)
        `)
                .eq("storehouse_id", selectedStorehouse)
                .order("product_id");
            if (error) throw error;
            return data;
        }
    });

    const totalValue = inventory?.reduce((sum, item: any) => {
        return sum + (item.quantity * (item.product?.default_selling_price || 0));
    }, 0) || 0;

    const totalQty = inventory?.reduce((sum, item: any) => sum + item.quantity, 0) || 0;

    return (
        <div className="space-y-4">
            {/* Storehouse Tabs */}
            <div className="flex gap-2">
                <button
                    onClick={() => setSelectedStorehouse(1)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedStorehouse === 1
                            ? "text-white"
                            : "bg-white border border-zinc-300 text-zinc-700"
                        }`}
                    style={selectedStorehouse === 1 ? { backgroundColor: "#3E2758" } : {}}
                >
                    GVM - Govindamangalam
                </button>
                <button
                    onClick={() => setSelectedStorehouse(2)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedStorehouse === 2
                            ? "text-white"
                            : "bg-white border border-zinc-300 text-zinc-700"
                        }`}
                    style={selectedStorehouse === 2 ? { backgroundColor: "#3E2758" } : {}}
                >
                    VEN - Vengannor
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-zinc-200 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Package className="text-blue-600" size={24} />
                        <p className="text-sm text-zinc-500">Total Quantity</p>
                    </div>
                    <p className="text-3xl font-bold" style={{ color: "#3E2758" }}>{totalQty}</p>
                </div>
                <div className="bg-white rounded-xl border border-zinc-200 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="text-green-600" size={24} />
                        <p className="text-sm text-zinc-500">Estimated Value</p>
                    </div>
                    <p className="text-3xl font-bold" style={{ color: "#3E2758" }}>₹{totalValue.toLocaleString()}</p>
                </div>
            </div>

            {/* Inventory List */}
            <div className="bg-white rounded-xl border border-zinc-200 p-6">
                <h3 className="font-bold mb-4" style={{ color: "#3E2758" }}>Current Stock</h3>
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: "#3E2758" }}></div>
                    </div>
                ) : inventory && inventory.length > 0 ? (
                    <div className="space-y-2">
                        {inventory.map((item: any) => (
                            <div key={item.product_id} className="flex items-center justify-between p-3 border border-zinc-200 rounded-lg">
                                <div>
                                    <p className="font-medium" style={{ color: "#3E2758" }}>{item.product?.name}</p>
                                    <p className="text-sm text-zinc-500">Product ID: {item.product_id}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold" style={{ color: "#3E2758" }}>{item.quantity}</p>
                                    <p className="text-xs text-zinc-500">units</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Package className="mx-auto mb-4 text-zinc-300" size={48} />
                        <p className="text-zinc-500">No inventory in this storehouse</p>
                    </div>
                )}
            </div>
        </div>
    );
}
