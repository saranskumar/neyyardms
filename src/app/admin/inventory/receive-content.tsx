"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Plus, AlertTriangle } from "lucide-react";
import { toast } from "@/lib/utils";

interface Product {
    id: number;
    name: string;
}

export default function ReceiveStockContent() {
    const [formData, setFormData] = useState({
        product_id: "",
        total_incoming: 0,
        arrival_damaged: 0,
        split_gvm: 0,
        split_ven: 0,
    });
    const queryClient = useQueryClient();

    const { data: products } = useQuery({
        queryKey: ["products"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("products")
                .select("id, name")
                .eq("is_active", true)
                .order("name");
            if (error) throw error;
            return data as Product[];
        }
    });

    const goodStock = formData.total_incoming - formData.arrival_damaged;
    const splitTotal = formData.split_gvm + formData.split_ven;
    const isValid = goodStock === splitTotal && goodStock > 0;

    const receiveMutation = useMutation({
        mutationFn: async () => {
            const { error } = await supabase.rpc("process_daily_arrival", {
                p_product_id: parseInt(formData.product_id),
                p_total_incoming: formData.total_incoming,
                p_arrival_damaged: formData.arrival_damaged,
                p_split_gvm: formData.split_gvm,
                p_split_ven: formData.split_ven,
            });
            if (error) throw error;
        },
        onSuccess: () => {
            toast("Stock received successfully!");
            queryClient.invalidateQueries({ queryKey: ["inventory"] });
            setFormData({
                product_id: "",
                total_incoming: 0,
                arrival_damaged: 0,
                split_gvm: 0,
                split_ven: 0,
            });
        },
        onError: (error: any) => {
            toast(error.message || "Failed to receive stock");
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) {
            toast("Split must equal good stock!");
            return;
        }
        receiveMutation.mutate();
    };

    return (
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <h2 className="text-xl font-bold mb-6" style={{ color: "#3E2758" }}>Receive Daily Stock</h2>

            <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "#3E2758" }}>Product</label>
                    <select
                        value={formData.product_id}
                        onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                        className="w-full border border-zinc-300 rounded-lg px-3 py-2 outline-none focus:border-violet-500"
                        required
                    >
                        <option value="">Select Product</option>
                        {products?.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "#3E2758" }}>Total Incoming</label>
                        <input
                            type="number"
                            value={formData.total_incoming}
                            onChange={(e) => setFormData({ ...formData, total_incoming: parseInt(e.target.value) || 0 })}
                            className="w-full border border-zinc-300 rounded-lg px-3 py-2 outline-none focus:border-violet-500"
                            required
                            min="1"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "#3E2758" }}>Damaged on Arrival</label>
                        <input
                            type="number"
                            value={formData.arrival_damaged}
                            onChange={(e) => setFormData({ ...formData, arrival_damaged: parseInt(e.target.value) || 0 })}
                            className="w-full border border-zinc-300 rounded-lg px-3 py-2 outline-none focus:border-violet-500"
                            min="0"
                        />
                    </div>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium" style={{ color: "#3E2758" }}>
                        Good Stock to Split: {goodStock} units
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "#3E2758" }}>Split to GVM (Govindamangalam)</label>
                        <input
                            type="number"
                            value={formData.split_gvm}
                            onChange={(e) => setFormData({ ...formData, split_gvm: parseInt(e.target.value) || 0 })}
                            className="w-full border border-zinc-300 rounded-lg px-3 py-2 outline-none focus:border-violet-500"
                            required
                            min="0"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "#3E2758" }}>Split to VEN (Vengannor)</label>
                        <input
                            type="number"
                            value={formData.split_ven}
                            onChange={(e) => setFormData({ ...formData, split_ven: parseInt(e.target.value) || 0 })}
                            className="w-full border border-zinc-300 rounded-lg px-3 py-2 outline-none focus:border-violet-500"
                            required
                            min="0"
                        />
                    </div>
                </div>

                {!isValid && splitTotal > 0 && (
                    <div className="p-3 bg-red-50 rounded-lg flex items-center gap-2">
                        <AlertTriangle className="text-red-600" size={16} />
                        <p className="text-sm text-red-600">
                            Split total ({splitTotal}) must equal good stock ({goodStock})
                        </p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={!isValid || receiveMutation.isPending}
                    className="w-full py-3 rounded-lg text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ backgroundColor: "#3E2758" }}
                >
                    <Plus size={20} />
                    {receiveMutation.isPending ? "Processing..." : "Receive Stock"}
                </button>
            </form>
        </div>
    );
}
