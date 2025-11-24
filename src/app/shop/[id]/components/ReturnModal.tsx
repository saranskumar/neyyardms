"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "@/lib/utils/index";
import { X, Package, Loader2, AlertTriangle } from "lucide-react";

interface ReturnModalProps {
    shopId: number;
    shopName: string;
    onClose: () => void;
}

export default function ReturnModal({ shopId, shopName, onClose }: ReturnModalProps) {
    const queryClient = useQueryClient();
    const [productId, setProductId] = useState("");
    const [qty, setQty] = useState("");
    const [condition, setCondition] = useState<"good" | "damaged">("good");
    const [refundAmount, setRefundAmount] = useState("");

    // Fetch products for dropdown
    const { data: products } = useQuery({
        queryKey: ["products_list"],
        queryFn: async () => {
            const { data } = await supabase
                .from("products")
                .select("id, name, default_selling_price")
                .eq("is_active", true);
            return data || [];
        }
    });

    const returnMutation = useMutation({
        mutationFn: async () => {
            const { error } = await supabase.rpc("process_sales_return", {
                p_shop_id: shopId,
                p_product_id: Number(productId),
                p_qty: Number(qty),
                p_return_condition: condition,
                p_storehouse_id: 2, // Hardcoded to Vengannor for now
                p_refund_amount: Number(refundAmount)
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shop", shopId] });
            queryClient.invalidateQueries({ queryKey: ["route_shops"] });
            queryClient.invalidateQueries({ queryKey: ["salesman_inventory"] });
            toast("Return processed successfully");
            onClose();
        },
        onError: (err: any) => {
            toast(err.message || "Failed to process return");
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!productId || !qty || Number(qty) <= 0) {
            toast("Select product and enter valid quantity");
            return;
        }
        if (!refundAmount || Number(refundAmount) < 0) {
            toast("Enter valid refund amount");
            return;
        }
        returnMutation.mutate();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Process Return</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="mb-4 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                    <p className="text-sm text-zinc-500">Shop</p>
                    <p className="font-bold text-zinc-900 dark:text-white">{shopName}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Product</label>
                        <select
                            className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-violet-500 outline-none"
                            value={productId}
                            onChange={(e) => setProductId(e.target.value)}
                        >
                            <option value="">Select Product</option>
                            {products?.map((p: any) => (
                                <option key={p.id} value={p.id}>
                                    {p.name} (₹{p.default_selling_price})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Quantity</label>
                        <input
                            type="number"
                            min="1"
                            className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-violet-500 outline-none"
                            placeholder="0"
                            value={qty}
                            onChange={(e) => setQty(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Condition</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setCondition("good")}
                                className={`p-3 rounded-xl border-2 transition-all ${condition === "good"
                                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                        : "border-zinc-200 dark:border-zinc-700"
                                    }`}
                            >
                                <Package size={20} className="mx-auto mb-1 text-green-600" />
                                <p className="text-sm font-medium">Good</p>
                            </button>
                            <button
                                type="button"
                                onClick={() => setCondition("damaged")}
                                className={`p-3 rounded-xl border-2 transition-all ${condition === "damaged"
                                        ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                                        : "border-zinc-200 dark:border-zinc-700"
                                    }`}
                            >
                                <AlertTriangle size={20} className="mx-auto mb-1 text-red-600" />
                                <p className="text-sm font-medium">Damaged</p>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Refund Amount (₹)</label>
                        <input
                            type="number"
                            step="0.01"
                            className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-violet-500 outline-none"
                            placeholder="0.00"
                            value={refundAmount}
                            onChange={(e) => setRefundAmount(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={returnMutation.isPending}
                            className="flex-1 py-3 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {returnMutation.isPending ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Processing...
                                </>
                            ) : (
                                "Process Return"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
