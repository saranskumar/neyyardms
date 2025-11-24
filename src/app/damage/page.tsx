"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "@/lib/utils/index";
import { ArrowLeft, AlertTriangle, Loader2 } from "lucide-react";
import Link from "next/link";

const DAMAGE_TYPES = [
    { value: "leakage", label: "Leakage" },
    { value: "transport", label: "Transport Damage" },
    { value: "arrival", label: "Arrival Damage" }
];

export default function DamagePage() {
    const queryClient = useQueryClient();
    const [productId, setProductId] = useState("");
    const [qty, setQty] = useState("");
    const [reason, setReason] = useState("");
    const [damageType, setDamageType] = useState("leakage");

    // Fetch products for dropdown
    const { data: products } = useQuery({
        queryKey: ["products_list"],
        queryFn: async () => {
            const { data } = await supabase
                .from("products")
                .select("id, name")
                .eq("is_active", true);
            return data || [];
        }
    });

    const reportDamageMutation = useMutation({
        mutationFn: async () => {
            const { error } = await supabase.rpc("report_damage", {
                p_storehouse_id: 2, // Hardcoded to Vengannor for now
                p_product_id: Number(productId),
                p_qty: Number(qty),
                p_reason: reason,
                p_type: damageType
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["salesman_inventory"] });
            toast("Damage reported successfully");
            setProductId("");
            setQty("");
            setReason("");
            setDamageType("leakage");
        },
        onError: (err: any) => {
            toast(err.message || "Failed to report damage");
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!productId || !qty || Number(qty) <= 0) {
            toast("Select product and enter valid quantity");
            return;
        }
        if (!reason.trim()) {
            toast("Enter reason for damage");
            return;
        }
        reportDamageMutation.mutate();
    };

    return (
        <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 pb-24">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/" className="p-2 bg-white dark:bg-zinc-900 rounded-full shadow-sm">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-xl font-bold">Report Damage</h1>
                    <p className="text-xs text-zinc-500">Log damaged or leaked items</p>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center text-red-600 dark:text-red-400">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h2 className="font-bold text-zinc-900 dark:text-white">Damage Report</h2>
                        <p className="text-xs text-zinc-500">This will reduce your stock</p>
                    </div>
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
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Quantity Damaged</label>
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
                        <label className="block text-sm font-medium mb-2">Damage Type</label>
                        <select
                            className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-violet-500 outline-none"
                            value={damageType}
                            onChange={(e) => setDamageType(e.target.value)}
                        >
                            {DAMAGE_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Reason</label>
                        <textarea
                            className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-violet-500 outline-none resize-none"
                            rows={3}
                            placeholder="Describe what happened..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={reportDamageMutation.isPending}
                        className="w-full py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
                    >
                        {reportDamageMutation.isPending ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Reporting...
                            </>
                        ) : (
                            <>
                                <AlertTriangle size={20} />
                                Report Damage
                            </>
                        )}
                    </button>
                </form>
            </div>
        </main>
    );
}
