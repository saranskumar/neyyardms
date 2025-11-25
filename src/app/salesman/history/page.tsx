"use client";

import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Receipt, Calendar, DollarSign } from "lucide-react";

interface Sale {
    id: number;
    total_revenue: number;
    cash_collected: number;
    outstanding_added: number;
    created_at: string;
    shop: {
        name: string;
    };
}

export default function HistoryPage() {
    const { user } = useAuth();

    const { data: sales, isLoading } = useQuery({
        queryKey: ["sales_history", user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            const { data, error } = await supabase
                .from("sales")
                .select(`
          *,
          shop:shops(name)
        `)
                .eq("salesman_id", user.id)
                .order("created_at", { ascending: false })
                .limit(50);
            if (error) throw error;
            return data as Sale[];
        },
        enabled: !!user?.id
    });

    const todaysSales = sales?.filter(sale =>
        new Date(sale.created_at).toDateString() === new Date().toDateString()
    ) || [];

    const todaysRevenue = todaysSales.reduce((sum, sale) => sum + sale.total_revenue, 0);
    const todaysCash = todaysSales.reduce((sum, sale) => sum + sale.cash_collected, 0);

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-xl font-bold" style={{ color: "#3E2758" }}>Sales History</h1>
                <p className="text-sm text-zinc-500">Your transaction history</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl border border-zinc-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="text-green-600" size={20} />
                        <p className="text-xs text-zinc-500">Today's Revenue</p>
                    </div>
                    <p className="text-2xl font-bold" style={{ color: "#3E2758" }}>₹{todaysRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-xl border border-zinc-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Receipt className="text-blue-600" size={20} />
                        <p className="text-xs text-zinc-500">Transactions</p>
                    </div>
                    <p className="text-2xl font-bold" style={{ color: "#3E2758" }}>{todaysSales.length}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-zinc-200 p-4">
                <h3 className="font-bold mb-3" style={{ color: "#3E2758" }}>Recent Sales</h3>
                {isLoading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: "#3E2758" }}></div>
                    </div>
                ) : sales && sales.length > 0 ? (
                    <div className="space-y-2">
                        {sales.map((sale) => (
                            <div key={sale.id} className="border border-zinc-200 rounded-lg p-3">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <p className="font-medium text-sm" style={{ color: "#3E2758" }}>
                                            {sale.shop?.name || "Unknown Shop"}
                                        </p>
                                        <div className="flex items-center gap-1 text-xs text-zinc-500 mt-1">
                                            <Calendar size={12} />
                                            <span>{new Date(sale.created_at).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold" style={{ color: "#3E2758" }}>₹{sale.total_revenue.toFixed(2)}</p>
                                        <p className="text-xs text-zinc-500">Revenue</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-100">
                                    <span className="text-green-600">Cash: ₹{sale.cash_collected.toFixed(2)}</span>
                                    {sale.outstanding_added > 0 && (
                                        <span className="text-red-600">Credit: ₹{sale.outstanding_added.toFixed(2)}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <Receipt className="mx-auto mb-2 text-zinc-300" size={40} />
                        <p className="text-zinc-500 text-sm">No sales yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}
