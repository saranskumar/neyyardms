"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, MapPin, AlertCircle, ChevronRight, IndianRupee } from "lucide-react";
import Link from "next/link";

export default function RoutePage() {
  // Fetch shops using view_shop_debt
  const { data: shops, isLoading } = useQuery({
    queryKey: ["route_shops"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("view_shop_debt")
        .select("*");

      if (error) throw error;
      return data;
    }
  });

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 pb-24">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/" className="p-2 bg-white dark:bg-zinc-900 rounded-full shadow-sm">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Today's Route</h1>
          <p className="text-xs text-zinc-500">Shops in order</p>
        </div>
      </div>

      {/* Shop List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8 text-zinc-500">Loading route...</div>
        ) : shops?.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">No shops on route.</div>
        ) : (
          shops?.map((shop: any, index: number) => {
            const hasDebt = shop.current_balance > 0;

            return (
              <Link
                key={shop.id}
                href={`/shop/${shop.id}`}
                className="block bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Route Order Badge */}
                    <div className="h-10 w-10 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center text-violet-600 dark:text-violet-400 font-bold">
                      {shop.route_order || index + 1}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-bold text-zinc-900 dark:text-white">
                        {shop.name}
                      </h3>

                      {/* Debt Warning */}
                      {hasDebt && (
                        <div className="flex items-center gap-1 mt-1">
                          <AlertCircle size={12} className="text-red-500" />
                          <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                            Outstanding: ₹{shop.current_balance.toFixed(2)}
                          </span>
                        </div>
                      )}

                      {/* Last Sale */}
                      {shop.last_sale_date && (
                        <p className="text-[10px] text-zinc-400 mt-0.5">
                          Last sale: {new Date(shop.last_sale_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="text-zinc-300" size={20} />
                </div>
              </Link>
            );
          })
        )}
      </div>
    </main>
  );
}
