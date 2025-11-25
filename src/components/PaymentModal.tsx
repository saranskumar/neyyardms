"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { X, DollarSign } from "lucide-react";
import { toast } from "@/lib/utils";

interface PaymentModalProps {
    shopId: number;
    shopName: string;
    currentBalance: number;
    onClose: () => void;
}

export default function PaymentModal({ shopId, shopName, currentBalance, onClose }: PaymentModalProps) {
    const [amount, setAmount] = useState<number>(0);
    const [notes, setNotes] = useState("");
    const queryClient = useQueryClient();

    const paymentMutation = useMutation({
        mutationFn: async () => {
            const { error } = await supabase.rpc("collect_payment", {
                p_shop_id: shopId,
                p_amount: amount,
                p_notes: notes || null
            });
            if (error) throw error;
        },
        onSuccess: () => {
            toast("Payment collected successfully!");
            queryClient.invalidateQueries({ queryKey: ["shop"] });
            queryClient.invalidateQueries({ queryKey: ["route_shops"] });
            onClose();
        },
        onError: (error: any) => {
            toast(error.message || "Failed to collect payment");
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (amount <= 0) {
            toast("Amount must be greater than 0");
            return;
        }
        paymentMutation.mutate();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold" style={{ color: "#3E2758" }}>Collect Payment</h2>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                <div className="mb-6 p-4 bg-zinc-50 rounded-xl">
                    <p className="text-sm text-zinc-500 mb-1">Shop</p>
                    <p className="font-bold" style={{ color: "#3E2758" }}>{shopName}</p>
                    <p className="text-sm mt-2">
                        <span className="text-zinc-500">Current Balance: </span>
                        <span className={`font-bold ${currentBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            ₹{Math.abs(currentBalance).toLocaleString()}
                        </span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "#3E2758" }}>
                            Payment Amount (₹)
                        </label>
                        <div className="flex items-center gap-2">
                            <DollarSign className="text-green-600" size={20} />
                            <input
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                                className="flex-1 border border-zinc-300 rounded-lg px-3 py-2 outline-none focus:border-violet-500"
                                placeholder="0.00"
                                required
                                autoFocus
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "#3E2758" }}>
                            Notes (Optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full border border-zinc-300 rounded-lg px-3 py-2 outline-none focus:border-violet-500"
                            rows={3}
                            placeholder="Add any notes..."
                        />
                    </div>

                    {amount > 0 && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium" style={{ color: "#3E2758" }}>
                                New Balance: ₹{(currentBalance - amount).toFixed(2)}
                            </p>
                        </div>
                    )}

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
                            disabled={paymentMutation.isPending || amount <= 0}
                            className="flex-1 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 disabled:opacity-50"
                            style={{ backgroundColor: "#3E2758" }}
                        >
                            {paymentMutation.isPending ? "Processing..." : "Collect Payment"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
