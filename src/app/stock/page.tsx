"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Package, Search, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function StockPage() {
    const [search, setSearch] = useState("");

    // Fetch Inventory (Assuming Storehouse 2 - Vengannor for Salesman for now, or dynamic)
    // Ideally, we fetch the storehouse assigned to the salesman or the van stock.
    // For this demo, let's assume Salesman sees "Vengannor" stock or "Van" stock.
    // Let's fetch Vengannor (ID 2) as per walkthrough scenario.
    const { data: inventory, isLoading } = useQuery({
        queryKey: ["salesman_inventory"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("inventory")
                .select(`
          quantity,
          product:products (
            id,
            name,
            default_selling_price
          )
        `)
                .eq("storehouse_id", 2); // Hardcoded to Vengannor for now

            if (error) throw error;
            return data;
        }
    });

    const filteredStock = inventory?.filter((item: any) =>
        item.product.name.toLowerCase().includes(search.toLowerCase())
    ) || [];

    return (
        <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 pb-24">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/" className="p-2 bg-white dark:bg-zinc-900 rounded-full shadow-sm">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-xl font-bold">My Stock</h1>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input
                    type="text"
                    placeholder="Search inventory..."
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-violet-500 outline-none"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Stock List */}
            <div className="space-y-3">
                {isLoading ? (
                    <div className="text-center py-8 text-zinc-500">Loading stock...</div>
                ) : filteredStock.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500">No stock found.</div>
                ) : (
                    filteredStock.map((item: any) => (
                        <div key={item.product.id} className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex justify-between items-center shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center text-violet-600 dark:text-violet-400">
                                    <Package size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-zinc-900 dark:text-white">{item.product.name}</h3>
                                    <p className="text-xs text-zinc-500">₹{item.product.default_selling_price} / unit</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`text-lg font-bold ${item.quantity < 10 ? "text-red-600" : "text-zinc-900 dark:text-white"}`}>
                                    {item.quantity}
                                </span>
                                <p className="text-[10px] text-zinc-400 uppercase font-medium">Available</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </main>
    );
}
