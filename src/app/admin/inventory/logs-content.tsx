"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Calendar, TrendingUp, Package } from "lucide-react";

interface StockLog {
    id: number;
    created_at: string;
    transaction_type: string;
    quantity: number;
    product_id: number;
    storehouse_id: number;
    product?: { name: string };
    storehouse?: { name: string };
}

export default function StockLogsContent() {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [filterType, setFilterType] = useState<"all" | "incoming" | "outgoing">("all");

    const { data: logs, isLoading } = useQuery({
        queryKey: ["stock_logs", selectedDate, filterType],
        queryFn: async () => {
            let query = supabase
                .from("stock_transactions")
                .select(`
          *,
          product:products(name),
          storehouse:storehouses(name)
        `)
                .gte("created_at", `${selectedDate}T00:00:00`)
                .lte("created_at", `${selectedDate}T23:59:59`)
                .order("created_at", { ascending: false });

            if (filterType === "incoming") {
                query = query.in("transaction_type", ["incoming", "split"]);
            } else if (filterType === "outgoing") {
                query = query.in("transaction_type", ["sale", "damage"]);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as StockLog[];
        }
    });

    const groupedLogs = logs?.reduce((acc: any, log) => {
        const date = new Date(log.created_at).toLocaleDateString();
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(log);
        return acc;
    }, {});

    const totalAdded = logs?.filter(l => ["incoming", "split"].includes(l.transaction_type))
        .reduce((sum, l) => sum + l.quantity, 0) || 0;

    const totalRemoved = logs?.filter(l => ["sale", "damage"].includes(l.transaction_type))
        .reduce((sum, l) => sum + Math.abs(l.quantity), 0) || 0;

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-xl border border-zinc-200 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "#3E2758" }}>Date</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full border border-zinc-300 rounded-lg px-3 py-2 outline-none focus:border-violet-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "#3E2758" }}>Filter Type</label>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as any)}
                            className="w-full border border-zinc-300 rounded-lg px-3 py-2 outline-none focus:border-violet-500"
                        >
                            <option value="all">All Transactions</option>
                            <option value="incoming">Stock Additions Only</option>
                            <option value="outgoing">Stock Removals Only</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-zinc-200 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="text-green-600" size={24} />
                        <p className="text-sm text-zinc-500">Stock Added</p>
                    </div>
                    <p className="text-3xl font-bold text-green-600">{totalAdded}</p>
                </div>
                <div className="bg-white rounded-xl border border-zinc-200 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Package className="text-red-600" size={24} />
                        <p className="text-sm text-zinc-500">Stock Removed</p>
                    </div>
                    <p className="text-3xl font-bold text-red-600">{totalRemoved}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-zinc-200 p-6">
                <h3 className="font-bold mb-4" style={{ color: "#3E2758" }}>
                    Transaction History - {new Date(selectedDate).toLocaleDateString()}
                </h3>
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: "#3E2758" }}></div>
                    </div>
                ) : logs && logs.length > 0 ? (
                    <div className="space-y-4">
                        {Object.entries(groupedLogs || {}).map(([date, dateLogs]: [string, any]) => (
                            <div key={date}>
                                <div className="flex items-center gap-2 mb-3">
                                    <Calendar size={16} className="text-zinc-400" />
                                    <h4 className="font-medium text-sm text-zinc-600">{date}</h4>
                                </div>
                                <div className="space-y-2">
                                    {dateLogs.map((log: StockLog) => (
                                        <div
                                            key={log.id}
                                            className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 hover:bg-zinc-50 transition-colors"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-sm" style={{ color: "#3E2758" }}>
                                                        {log.product?.name}
                                                    </p>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${["incoming", "split"].includes(log.transaction_type)
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-700"
                                                        }`}>
                                                        {log.transaction_type}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-zinc-500 mt-1">
                                                    {log.storehouse?.name} • {new Date(log.created_at).toLocaleTimeString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-lg font-bold ${["incoming", "split"].includes(log.transaction_type)
                                                        ? "text-green-600"
                                                        : "text-red-600"
                                                    }`}>
                                                    {["incoming", "split"].includes(log.transaction_type) ? "+" : "-"}
                                                    {Math.abs(log.quantity)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Calendar className="mx-auto mb-4 text-zinc-300" size={48} />
                        <p className="text-zinc-500">No transactions for this date</p>
                    </div>
                )}
            </div>
        </div>
    );
}
