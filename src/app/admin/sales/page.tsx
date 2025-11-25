"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { BarChart3, Calendar, DollarSign, TrendingUp, Download } from "lucide-react";

export default function SalesPage() {
    const [dateFilter, setDateFilter] = useState(new Date().toISOString().split("T")[0]);

    const { data: sales, isLoading } = useQuery({
        queryKey: ["sales", dateFilter],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("sales")
                .select(`
          *,
          shop:shops(name),
          salesman:users!sales_salesman_id_fkey(full_name)
        `)
                .gte("created_at", `${dateFilter}T00:00:00`)
                .lte("created_at", `${dateFilter}T23:59:59`)
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        }
    });

    const totalRevenue = sales?.reduce((sum, sale) => sum + sale.total_revenue, 0) || 0;
    const totalCash = sales?.reduce((sum, sale) => sum + sale.cash_collected, 0) || 0;
    const totalCredit = sales?.reduce((sum, sale) => sum + sale.outstanding_added, 0) || 0;
    const totalProfit = sales?.reduce((sum, sale) => sum + sale.total_profit, 0) || 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: "#3E2758" }}>Sales & Reports</h1>
                    <p className="text-zinc-500">View sales analytics and history</p>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="border border-zinc-300 rounded-lg px-3 py-2 outline-none focus:border-violet-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-zinc-200 p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="text-green-600" size={20} />
                        <p className="text-sm text-zinc-500">Total Revenue</p>
                    </div>
                    <p className="text-3xl font-bold" style={{ color: "#3E2758" }}>₹{totalRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-xl border border-zinc-200 p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="text-blue-600" size={20} />
                        <p className="text-sm text-zinc-500">Cash Collected</p>
                    </div>
                    <p className="text-3xl font-bold" style={{ color: "#3E2758" }}>₹{totalCash.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-xl border border-zinc-200 p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar className="text-red-600" size={20} />
                        <p className="text-sm text-zinc-500">Credit Given</p>
                    </div>
                    <p className="text-3xl font-bold" style={{ color: "#3E2758" }}>₹{totalCredit.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-xl border border-zinc-200 p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="text-purple-600" size={20} />
                        <p className="text-sm text-zinc-500">Total Profit</p>
                    </div>
                    <p className="text-3xl font-bold" style={{ color: "#3E2758" }}>₹{totalProfit.toLocaleString()}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-zinc-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold" style={{ color: "#3E2758" }}>Sales Transactions</h3>
                    <button className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900">
                        <Download size={16} />
                        Export CSV
                    </button>
                </div>

                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: "#3E2758" }}></div>
                    </div>
                ) : sales && sales.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-zinc-200">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-600">Time</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-600">Shop</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-600">Salesman</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-zinc-600">Revenue</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-zinc-600">Cash</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-zinc-600">Credit</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-zinc-600">Profit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sales.map((sale: any) => (
                                    <tr key={sale.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                                        <td className="py-3 px-4 text-sm text-zinc-600">
                                            {new Date(sale.created_at).toLocaleTimeString()}
                                        </td>
                                        <td className="py-3 px-4 text-sm font-medium" style={{ color: "#3E2758" }}>
                                            {sale.shop?.name || "Unknown"}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-zinc-600">
                                            {sale.salesman?.full_name || "Unknown"}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-right font-medium">
                                            ₹{sale.total_revenue.toFixed(2)}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-right text-green-600">
                                            ₹{sale.cash_collected.toFixed(2)}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-right text-red-600">
                                            ₹{sale.outstanding_added.toFixed(2)}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-right font-medium text-purple-600">
                                            ₹{sale.total_profit.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <BarChart3 className="mx-auto mb-4 text-zinc-300" size={48} />
                        <p className="text-zinc-500">No sales for this date</p>
                    </div>
                )}
            </div>
        </div>
    );
}
