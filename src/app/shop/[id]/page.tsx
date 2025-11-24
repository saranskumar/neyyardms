"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Store, IndianRupee, Package, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import PaymentModal from "./components/PaymentModal";
import ReturnModal from "./components/ReturnModal";
import { toast } from "@/lib/utils/index";

export default function ShopDetailPage() {
    const params = useParams();
    const router = useRouter();
    const shopId = params.id;
    const [showPayment, setShowPayment] = useState(false);
    const [showReturn, setShowReturn] = useState(false);

    // Fetch shop details
    const { data: shop, isLoading } = useQuery({
        queryKey: ["shop", shopId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("shops")
                .select("*")
                .eq("id", shopId)
                .single();

            if (error) throw error;
            return data;
        },
        enabled: !!shopId
    });

    const hasDebt = shop && shop.current_balance > 0;

    return (
        <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 pb-24">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/route" className="p-2 bg-white dark:bg-zinc-900 rounded-full shadow-sm">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-xl font-bold">Shop Details</h1>
            </div>

            {isLoading ? (
                <div className="text-center py-8 text-zinc-500">Loading shop...</div>
            ) : !shop ? (
                <div className="text-center py-8 text-zinc-500">Shop not found.</div>
            ) : (
                <div className="space-y-4">
                    {/* Shop Profile Card */}
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="h-16 w-16 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center text-violet-600 dark:text-violet-400">
                                <Store size={32} />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">
                                    {shop.name}
                                </h2>
                                {shop.image_url && (
                                    <p className="text-xs text-zinc-400">ID: {shop.id}</p>
                                )}
                            </div>
                        </div>

                        {/* Balance Section */}
                        <div className={`p-4 rounded-xl ${hasDebt
                                ? "bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30"
                                : "bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30"
                            }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {hasDebt && <AlertCircle size={16} className="text-red-500" />}
                                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                                        Current Balance
                                    </span>
                                </div>
                                <span className={`text-2xl font-bold ${hasDebt ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
                                    }`}>
                                    ₹{shop.current_balance.toFixed(2)}
                                </span>
                            </div>
                            {hasDebt && (
                                <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                                    Outstanding payment due
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={() => router.push(`/pos?shop=${shopId}`)}
                            className="w-full flex items-center justify-between p-4 bg-violet-600 text-white rounded-xl font-bold shadow-lg hover:bg-violet-700 transition-colors active:scale-[0.98]"
                        >
                            <span className="flex items-center gap-2">
                                <Package size={20} />
                                New Sale
                            </span>
                            <span className="text-sm opacity-80">Go to POS →</span>
                        </button>

                        <button
                            onClick={() => setShowPayment(true)}
                            className="w-full flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors active:scale-[0.98]"
                        >
                            <span className="flex items-center gap-2 text-zinc-900 dark:text-white">
                                <IndianRupee size={20} />
                                Collect Payment
                            </span>
                        </button>

                        <button
                            onClick={() => setShowReturn(true)}
                            className="w-full flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors active:scale-[0.98]"
                        >
                            <span className="flex items-center gap-2 text-zinc-900 dark:text-white">
                                <Package size={20} />
                                Process Return
                            </span>
                        </button>
                    </div>
                </div>
            )}

            {/* Modals */}
            {showPayment && (
                <PaymentModal
                    shopId={Number(shopId)}
                    shopName={shop?.name || ""}
                    onClose={() => setShowPayment(false)}
                />
            )}

            {showReturn && (
                <ReturnModal
                    shopId={Number(shopId)}
                    shopName={shop?.name || ""}
                    onClose={() => setShowReturn(false)}
                />
            )}
        </main>
    );
}
