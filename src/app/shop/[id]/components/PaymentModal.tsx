"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "@/lib/utils/index";
import { X, IndianRupee, Loader2 } from "lucide-react";

interface PaymentModalProps {
    shopId: number;
    shopName: string;
    onClose: () => void;
}

export default function PaymentModal({ shopId, shopName, onClose }: PaymentModalProps) {
    const queryClient = useQueryClient();
    const [amount, setAmount] = useState("");
    const [notes, setNotes] = useState("");

    const collectMutation = useMutation({
        mutationFn: async () => {
            const { error } = await supabase.rpc("collect_payment", {
                p_shop_id: shopId,
                p_amount: Number(amount),
                p_notes: notes || null
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shop", shopId] });
            queryClient.invalidateQueries({ queryKey: ["route_shops"] });
            toast("Payment collected successfully");
            onClose();
        },
        onError: (err: any) => {
            toast(err.message || "Failed to collect payment");
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || Number(amount) <= 0) {
            toast("Enter a valid amount");
            return;
        }
        collectMutation.mutate();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 animate-in slide-in-from-bottom sm:slide-in-from-bottom-0">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Collect Payment</h2>
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
                        <label className="block text-sm font-medium mb-2">Amount (₹)</label>
                        <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                            <input
                                type="number"
                                step="0.01"
                                className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-violet-500 outline-none"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                        <textarea
                            className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-violet-500 outline-none resize-none"
                            rows={3}
                            placeholder="Add notes..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
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
                            disabled={collectMutation.isPending}
                            className="flex-1 py-3 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {collectMutation.isPending ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Processing...
                                </>
                            ) : (
                                "Collect Payment"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
