"use client";

import { BarChart3, Calendar } from "lucide-react";

export default function SalesPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: "#3E2758" }}>Sales & Reports</h1>
                    <p className="text-zinc-500">View sales history and analytics</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-300 text-zinc-700 font-medium">
                    <Calendar size={20} />
                    Filter by Date
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-zinc-200 p-6">
                    <p className="text-sm text-zinc-500">Total Sales</p>
                    <p className="text-3xl font-bold mt-2" style={{ color: "#3E2758" }}>₹0</p>
                </div>
                <div className="bg-white rounded-xl border border-zinc-200 p-6">
                    <p className="text-sm text-zinc-500">Transactions</p>
                    <p className="text-3xl font-bold mt-2" style={{ color: "#3E2758" }}>0</p>
                </div>
                <div className="bg-white rounded-xl border border-zinc-200 p-6">
                    <p className="text-sm text-zinc-500">Avg. Sale</p>
                    <p className="text-3xl font-bold mt-2" style={{ color: "#3E2758" }}>₹0</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-zinc-200 p-6">
                <div className="text-center py-12">
                    <BarChart3 className="mx-auto mb-4 text-zinc-300" size={48} />
                    <p className="text-zinc-500">No sales data yet</p>
                    <p className="text-sm text-zinc-400 mt-1">Sales will appear here once transactions are made</p>
                </div>
            </div>
        </div>
    );
}
