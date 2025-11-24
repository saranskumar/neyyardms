"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/lib/utils/index";
import { Database, CheckCircle, Loader2 } from "lucide-react";

export default function SeedPage() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string[]>([]);

    const products = [
        { name: "Milk 500ml", default_cost_price: 22, default_selling_price: 26 },
        { name: "Curd 500ml", default_cost_price: 25, default_selling_price: 30 },
        { name: "Ghee 200ml", default_cost_price: 180, default_selling_price: 220 },
        { name: "Butter 100g", default_cost_price: 55, default_selling_price: 65 },
        { name: "Paneer 200g", default_cost_price: 85, default_selling_price: 105 },
        { name: "Badam Milk", default_cost_price: 30, default_selling_price: 40 },
        { name: "Sambharam", default_cost_price: 10, default_selling_price: 15 },
    ];

    const shops = [
        { name: "Sree Padmanabha Stores", route_order: 1 },
        { name: "Devi Bakery", route_order: 2 },
        { name: "Neyyar Mart", route_order: 3 },
        { name: "City Supermarket", route_order: 4 },
        { name: "Lulu Daily", route_order: 5 },
    ];

    const routes = [
        { name: "City Circle", description: "Main city loop" },
        { name: "Coastal Route", description: "Beach side shops" },
    ];

    async function seedDatabase() {
        setLoading(true);
        setStatus([]);

        try {
            // 1. Products
            const { error: pError } = await supabase.from("products").upsert(products, { onConflict: "name" });
            if (pError) throw pError;
            addStatus("Products seeded successfully");

            // 2. Routes
            const { error: rError } = await supabase.from("routes").upsert(routes, { onConflict: "name" });
            if (rError) throw rError;
            addStatus("Routes seeded successfully");

            // 3. Shops
            // We need a route ID to assign, let's just get the first one
            const { data: routeData } = await supabase.from("routes").select("id").limit(1).single();
            const routeId = routeData?.id;

            const shopsWithRoute = shops.map(s => ({ ...s, route_id: routeId }));
            const { error: sError } = await supabase.from("shops").upsert(shopsWithRoute, { onConflict: "name" });
            if (sError) throw sError;
            addStatus("Shops seeded successfully");

            toast("Database seeded successfully!");
        } catch (err: any) {
            addStatus(`Error: ${err.message}`);
            toast(err.message);
        } finally {
            setLoading(false);
        }
    }

    function addStatus(msg: string) {
        setStatus(prev => [...prev, msg]);
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Database Seeder</h1>
                <p className="text-zinc-500">Populate your database with sample data for testing.</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm text-center">
                <div className="h-16 w-16 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-violet-600 dark:text-violet-400">
                    <Database size={32} />
                </div>
                <h2 className="text-lg font-bold mb-2">Ready to Seed</h2>
                <p className="text-zinc-500 mb-6 max-w-md mx-auto">
                    This will add {products.length} products, {shops.length} shops, and {routes.length} routes to your database.
                    Existing items with the same names will be updated.
                </p>

                <button
                    onClick={seedDatabase}
                    disabled={loading}
                    className="px-6 py-3 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 disabled:opacity-50 flex items-center gap-2 mx-auto"
                >
                    {loading ? <Loader2 className="animate-spin" /> : "Run Seeder"}
                </button>
            </div>

            {status.length > 0 && (
                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    <h3 className="font-bold mb-4">Execution Log</h3>
                    <div className="space-y-2">
                        {status.map((msg, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                                <CheckCircle size={16} className="text-green-500" />
                                <span>{msg}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
