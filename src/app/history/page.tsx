"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/lib/useUser";
import { ArrowLeft, Calendar, Clock, Receipt } from "lucide-react";
import Link from "next/link";

export default function HistoryPage() {
    const user = useUser();

    const { data: sales, isLoading } = useQuery({
        queryKey: ["salesman_history", user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            const { data, error } = await supabase
                .from("sales")
                .select(`
          id,
          created_at,
          total_revenue,
          cash_collected,
          shop:shops (name)
        `)
                .eq("salesman_id", user.id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data;
        },
        enabled: !!user?.id
    });

    return (
        <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 pb-24">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/" className="p-2 bg-white dark:bg-zinc-900 rounded-full shadow-sm">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-xl font-bold">History</h1>
            </div>

            <div className="space-y-4">
                {isLoading ? (
                    <div className="text-center py-8 text-zinc-500">Loading history...</div>
                ) : sales?.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500">No transactions yet.</div>
                ) : (
                    sales?.map((sale: any) => (
                        <div key={sale.id} className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-zinc-900 dark:text-white">{sale.shop?.name || "Unknown Shop"}</h3>
                                    <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                                        <Calendar size={12} />
                                        <span>{new Date(sale.created_at).toLocaleDateString()}</span>
                                        <Clock size={12} className="ml-1" />
                                        <span>{new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-violet-600">₹{sale.total_revenue}</span>
                                    <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                                        Paid: ₹{sale.cash_collected}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-zinc-400 border-t border-zinc-100 dark:border-zinc-800 pt-2 mt-2">
                                <Receipt size={12} />
                                <span>Txn ID: #{sale.id}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </main>
    );
}
