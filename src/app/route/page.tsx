"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type ShopDebt = {
  id: number;
  name: string;
  last_sale_date: string | null;
  current_balance: number;
};

export default function RouteList() {
  const [shops, setShops] = useState<ShopDebt[]>([]);

  async function fetchShops() {
    const { data, error } = await supabase
      .from("view_shop_debt")
      .select("id, name, last_sale_date, current_balance");

    if (!error && data) {
      setShops(data as ShopDebt[]);
    }
  }

  useEffect(() => {
    fetchShops();
  }, []);

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Route / Shops</h1>
      <div className="space-y-3">
        {shops.map((s) => (
          <Link
            key={s.id}
            href={`/shop/${s.id}`}
            className="block p-3 bg-white rounded shadow flex justify-between items-center"
          >
            <div>
              <div className="font-medium">{s.name}</div>
              <div className="text-sm text-gray-500">
                {s.last_sale_date
                  ? new Date(s.last_sale_date).toLocaleString()
                  : "No recent sales"}
              </div>
            </div>

            <div
              className={
                s.current_balance > 0
                  ? "text-red-600 font-semibold"
                  : "text-green-600 font-semibold"
              }
            >
              ₹{s.current_balance}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
