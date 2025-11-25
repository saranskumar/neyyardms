"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Package, CheckCircle, AlertTriangle, TrendingDown } from "lucide-react";
import { toast } from "@/lib/utils";

interface Product {
    id: number;
    name: string;
}

interface InventoryItem {
    product_id: number;
    storehouse_id: number;
    quantity: number;
    product?: { name: string };
}

export default function ReconciliationPage() {
    const [selectedStorehouse, setSelectedStorehouse] = useState<1 | 2>(1);
    const [physicalCount, setPhysicalCount] = useState<Record<number, number>>({});
    const queryClient = useQueryClient();

    const { data: inventory } = useQuery({
        queryKey: ["inventory_reconciliation", selectedStorehouse],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("inventory")
                .select(`
          *,
          product:products(name)
        `)
                .eq("storehouse_id", selectedStorehouse)
                .order("product_id");
            if (error) throw error;
            return data as InventoryItem[];
        }
    });

    const reconcileMutation = useMutation({
        mutationFn: async (productId: number) => {
            const systemQty = inventory?.find(i => i.product_id === productId)?.quantity || 0;
            const physicalQty = physicalCount[productId] || 0;
            const diff = physicalQty - systemQty;

            if (diff === 0) {
                throw new Error("No discrepancy to reconcile");
            }

            const { error } = await supabase.rpc("admin_reconcile_stock", {
                p_product_id: productId,
                p_storehouse_id: selectedStorehouse,
                p_adjustment_quantity: diff,
                p_reason: `Reconciliation: System=${systemQty}, Physical=${physicalQty}, Diff=${diff}`
            });

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inventory_reconciliation"] });
            toast("Stock reconciled successfully");
        },
        onError: (error: any) => {
            toast(error.message || "Failed to reconcile stock");
        }
    });

    const reconcileAllMutation = useMutation({
        mutationFn: async () => {
            const discrepancies = inventory?.filter(item => {
                const physical = physicalCount[item.product_id];
                return physical !== undefined && physical !== item.quantity;
            }) || [];

            for (const item of discrepancies) {
                const diff = physicalCount[item.product_id] - item.quantity;
                await supabase.rpc("admin_reconcile_stock", {
                    p_product_id: item.product_id,
                    p_storehouse_id: selectedStorehouse,
                    p_adjustment_quantity: diff,
                    p_reason: `Bulk Reconciliation: System=${item.quantity}, Physical=${physicalCount[item.product_id]}, Diff=${diff}`
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inventory_reconciliation"] });
            toast(`Reconciled ${inventory?.filter(i => physicalCount[i.product_id] !== undefined && physicalCount[i.product_id] !== i.quantity).length || 0} items`);
            setPhysicalCount({});
        },
        onError: (error: any) => {
            toast(error.message || "Failed to reconcile all items");
        }
    });

    const discrepancies = inventory?.filter(item => {
        const physical = physicalCount[item.product_id];
        return physical !== undefined && physical !== item.quantity;
    }) || [];

    const totalDiscrepancy = discrepancies.reduce((sum, item) => {
        return sum + Math.abs((physicalCount[item.product_id] || 0) - item.quantity);
    }, 0);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: "#3E2758" }}>Stock Reconciliation</h1>
                <p className="text-zinc-500">Match physical stock with system records</p>
            </div>

            {/* Storehouse Selection */}
            <div className="bg-white rounded-xl border border-zinc-200 p-4">
                <label className="block text-sm font-medium mb-2" style={{ color: "#3E2758" }}>Storehouse</label>
                <div className="flex gap-2">
                    <button
                        onClick={() => setSelectedStorehouse(1)}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${selectedStorehouse === 1 ? "text-white" : "border border-zinc-300"
                            }`}
                        style={selectedStorehouse === 1 ? { backgroundColor: "#3E2758" } : {}}
                    >
                        GVM - Govindamangalam
                    </button>
                    <button
                        onClick={() => setSelectedStorehouse(2)}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${selectedStorehouse === 2 ? "text-white" : "border border-zinc-300"
                            }`}
                        style={selectedStorehouse === 2 ? { backgroundColor: "#3E2758" } : {}}
                    >
                        VEN - Vengannor
                    </button>
                </div>
            </div>

            {/* Summary */}
            {discrepancies.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="text-orange-600 flex-shrink-0" size={20} />
                        <div className="flex-1">
                            <p className="font-bold text-orange-900">Discrepancies Found</p>
                            <p className="text-sm text-orange-700 mt-1">
                                {discrepancies.length} items with differences • Total: {totalDiscrepancy} units
                            </p>
                        </div>
                        <button
                            onClick={() => reconcileAllMutation.mutate()}
                            disabled={reconcileAllMutation.isPending}
                            className="px-4 py-2 rounded-lg text-white font-medium text-sm disabled:opacity-50"
                            style={{ backgroundColor: "#3E2758" }}
                        >
                            {reconcileAllMutation.isPending ? "Processing..." : "Reconcile All"}
                        </button>
                    </div>
                </div>
            )}

            {/* Inventory List */}
            <div className="bg-white rounded-xl border border-zinc-200 p-6">
                <h3 className="font-bold mb-4" style={{ color: "#3E2758" }}>Stock Count</h3>
                {inventory && inventory.length > 0 ? (
                    <div className="space-y-3">
                        {inventory.map((item) => {
                            const physical = physicalCount[item.product_id];
                            const hasDiscrepancy = physical !== undefined && physical !== item.quantity;
                            const diff = physical !== undefined ? physical - item.quantity : 0;

                            return (
                                <div
                                    key={item.product_id}
                                    className={`p-4 rounded-xl border-2 transition-colors ${hasDiscrepancy
                                            ? "border-orange-200 bg-orange-50"
                                            : "border-zinc-200"
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <p className="font-bold" style={{ color: "#3E2758" }}>
                                                {item.product?.name}
                                            </p>
                                            <p className="text-sm text-zinc-500">System: {item.quantity} units</p>
                                        </div>
                                        {hasDiscrepancy && (
                                            <button
                                                onClick={() => reconcileMutation.mutate(item.product_id)}
                                                disabled={reconcileMutation.isPending}
                                                className="px-3 py-1 rounded-lg text-white text-sm font-medium disabled:opacity-50"
                                                style={{ backgroundColor: "#3E2758" }}
                                            >
                                                Reconcile
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <label className="block text-xs text-zinc-500 mb-1">Physical Count</label>
                                            <input
                                                type="number"
                                                value={physical ?? ""}
                                                onChange={(e) => {
                                                    const value = e.target.value === "" ? undefined : parseInt(e.target.value);
                                                    setPhysicalCount(prev => ({
                                                        ...prev,
                                                        [item.product_id]: value ?? 0
                                                    }));
                                                }}
                                                className="w-full border border-zinc-300 rounded-lg px-3 py-2 outline-none focus:border-violet-500"
                                                placeholder="Enter count"
                                            />
                                        </div>

                                        {hasDiscrepancy && (
                                            <div className="text-center">
                                                <p className="text-xs text-zinc-500 mb-1">Difference</p>
                                                <p className={`text-lg font-bold ${diff > 0 ? "text-green-600" : "text-red-600"}`}>
                                                    {diff > 0 ? "+" : ""}{diff}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Package className="mx-auto mb-4 text-zinc-300" size={48} />
                        <p className="text-zinc-500">No inventory to reconcile</p>
                    </div>
                )}
            </div>
        </div>
    );
}
