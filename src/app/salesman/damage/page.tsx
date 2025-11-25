"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { AlertTriangle, Plus, X } from "lucide-react";
import { toast } from "@/lib/utils";

interface Product {
    id: number;
    name: string;
}

const DAMAGE_TYPES = [
    { value: "leakage", label: "Leakage" },
    { value: "transport", label: "Transport Damage" },
    { value: "reconciliation_loss", label: "Reconciliation Loss" },
] as const;

export default function DamagePage() {
    const { activeStorehouse } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const queryClient = useQueryClient();

    const { data: recentDamages } = useQuery({
        queryKey: ["damage_logs"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("damage_logs")
                .select(`
          *,
          product:products(name),
          storehouse:storehouses(name)
        `)
                .order("created_at", { ascending: false })
                .limit(20);
            if (error) throw error;
            return data;
        }
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold" style={{ color: "#3E2758" }}>Damage Report</h1>
                    <p className="text-sm text-zinc-500">Report damaged or lost items</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium"
                    style={{ backgroundColor: "#3E2758" }}
                >
                    <Plus size={20} />
                    Report Damage
                </button>
            </div>

            <div className="bg-white rounded-xl border border-zinc-200 p-4">
                <h3 className="font-bold mb-3" style={{ color: "#3E2758" }}>Recent Reports</h3>
                {recentDamages && recentDamages.length > 0 ? (
                    <div className="space-y-2">
                        {recentDamages.map((damage: any) => (
                            <div key={damage.id} className="border border-zinc-200 rounded-lg p-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="font-medium text-sm" style={{ color: "#3E2758" }}>
                                            {damage.product?.name}
                                        </p>
                                        <p className="text-xs text-zinc-500 mt-1">
                                            {damage.storehouse?.name || "Unknown"} • {damage.damage_type}
                                        </p>
                                        {damage.notes && (
                                            <p className="text-xs text-zinc-600 mt-1">{damage.notes}</p>
                                        )}
                                        <p className="text-xs text-zinc-400 mt-1">
                                            {new Date(damage.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <span className="text-red-600 font-bold">{damage.quantity}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <AlertTriangle className="mx-auto mb-2 text-zinc-300" size={40} />
                        <p className="text-zinc-500 text-sm">No damage reports</p>
                    </div>
                )}
            </div>

            {showModal && (
                <DamageModal
                    storehouseId={activeStorehouse}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        queryClient.invalidateQueries({ queryKey: ["damage_logs"] });
                        queryClient.invalidateQueries({ queryKey: ["inventory"] });
                        queryClient.invalidateQueries({ queryKey: ["salesman_stocks"] });
                        setShowModal(false);
                    }}
                />
            )}
        </div>
    );
}

function DamageModal({
    storehouseId,
    onClose,
    onSuccess
}: {
    storehouseId: number | null;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [formData, setFormData] = useState({
        product_id: "",
        quantity: 0,
        damage_type: "leakage" as const,
        reason: ""
    });

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

    const damageMutation = useMutation({
        mutationFn: async () => {
            if (!storehouseId) throw new Error("No storehouse selected");

            const { error } = await supabase.rpc("report_damage", {
                p_storehouse_id: storehouseId,
                p_product_id: parseInt(formData.product_id),
                p_qty: formData.quantity,
                p_reason: formData.reason || null,
                p_type: formData.damage_type
            });
            if (error) throw error;
        },
        onSuccess: () => {
            toast("Damage reported successfully");
            onSuccess();
        },
        onError: (error: any) => {
            toast(error.message || "Failed to report damage");
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!storehouseId) {
            toast("Please select a storehouse first");
            return;
        }
        damageMutation.mutate();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold" style={{ color: "#3E2758" }}>Report Damage</h2>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "#3E2758" }}>
                            Product
                        </label>
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

                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "#3E2758" }}>
                            Quantity
                        </label>
                        <input
                            type="number"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                            className="w-full border border-zinc-300 rounded-lg px-3 py-2 outline-none focus:border-violet-500"
                            required
                            min="1"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "#3E2758" }}>
                            Damage Type
                        </label>
                        <select
                            value={formData.damage_type}
                            onChange={(e) => setFormData({ ...formData, damage_type: e.target.value as any })}
                            className="w-full border border-zinc-300 rounded-lg px-3 py-2 outline-none focus:border-violet-500"
                        >
                            {DAMAGE_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "#3E2758" }}>
                            Reason / Notes
                        </label>
                        <textarea
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            className="w-full border border-zinc-300 rounded-lg px-3 py-2 outline-none focus:border-violet-500"
                            rows={3}
                            placeholder="Describe the damage..."
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-zinc-300 rounded-lg font-medium hover:bg-zinc-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={damageMutation.isPending}
                            className="flex-1 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 disabled:opacity-50"
                            style={{ backgroundColor: "#3E2758" }}
                        >
                            {damageMutation.isPending ? "Reporting..." : "Report Damage"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
