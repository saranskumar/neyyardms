"use client";

import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Package, TrendingDown } from "lucide-react";

interface InventoryItem {
    product_id: number;
    quantity: number;
    product: {
        name: string;
        default_selling_price: number;
    };
}

export default function StocksPage() {
    const { activeStorehouse } = useAuth();

    const { data: inventory, isLoading } = useQuery({
        queryKey: ["salesman_stocks", activeStorehouse],
        queryFn: async () => {
            if (!activeStorehouse) return [];
            const { data, error } = await supabase
                .from("inventory")
                .select(`
          *,
          product:products(name, default_selling_price)
        `)
                .eq("storehouse_id", activeStorehouse)
                .order("product_id");
            if (error) throw error;
            return data as InventoryItem[];
        },
        enabled: !!activeStorehouse
    });

    const totalValue = inventory?.reduce((sum, item) => {
        return sum + (item.quantity * (item.product?.default_selling_price || 0));
    }, 0) || 0;

    const totalQty = inventory?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-xl font-bold" style={{ color: "#3E2758" }}>Current Stock</h1>
                <p className="text-sm text-zinc-500">Your inventory</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl border border-zinc-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Package className="text-blue-600" size={20} />
                        <p className="text-xs text-zinc-500">Total Items</p>
                    </div>
                    <p className="text-2xl font-bold" style={{ color: "#3E2758" }}>{totalQty}</p>
                </div>
                <div className="bg-white rounded-xl border border-zinc-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="text-green-600" size={20} />
                        <p className="text-xs text-zinc-500">Total Value</p>
                    </div>
                    <p className="text-2xl font-bold" style={{ color: "#3E2758" }}>₹{totalValue.toLocaleString()}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-zinc-200 p-4">
                <h3 className="font-bold mb-3" style={{ color: "#3E2758" }}>Stock Details</h3>
                {isLoading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: "#3E2758" }}></div>
                    </div>
                ) : inventory && inventory.length > 0 ? (
                    <div className="space-y-2">
                        {inventory.map((item) => (
                            <div key={item.product_id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-sm" style={{ color: "#3E2758" }}>
                                        {item.product?.name}
                                    </p>
                                    <p className="text-xs text-zinc-500">
                                        ₹{item.product?.default_selling_price} each
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold" style={{ color: "#3E2758" }}>{item.quantity}</p>
                                    <p className="text-xs text-zinc-500">units</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <Package className="mx-auto mb-2 text-zinc-300" size={40} />
                        <p className="text-zinc-500 text-sm">No stock available</p>
                    </div>
                )}
            </div>
        </div>
    );
}
