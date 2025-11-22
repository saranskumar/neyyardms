"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { money } from "@/lib/utils";

type InventoryRow = {
  storehouse_id: number;
  product_id: number;
  quantity: number;
  product_name?: string | null;
  product_image?: string | null;
};

type Grouped = {
  storehouseId: number;
  items: InventoryRow[];
};

export default function InventoryViewPage() {
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadInventory() {
    setLoading(true);
    // join inventory with products (selecting useful fields)
    const { data, error } = await supabase
      .from("inventory")
      .select(`
        storehouse_id,
        product_id,
        quantity,
        product:products (name, image_url)
      `);

    if (error) {
      console.error("Failed to load inventory:", error);
      setRows([]);
      setLoading(false);
      return;
    }

    const mapped: InventoryRow[] = (data || []).map((r: any) => ({
      storehouse_id: r.storehouse_id,
      product_id: r.product_id,
      quantity: r.quantity,
      product_name: r.product?.name ?? null,
      product_image: r.product?.image_url ?? null
    }));

    setRows(mapped);
    setLoading(false);
  }

  useEffect(() => {
    loadInventory();
  }, []);

  const groups: Grouped[] = [1, 2].map((sid) => ({
    storehouseId: sid,
    items: rows.filter((r) => r.storehouse_id === sid)
  }));

  return (
    <main className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Inventory (Storehouse-wise)</h1>

      {loading && <div>Loading inventory…</div>}

      {!loading &&
        groups.map((g) => (
          <section key={g.storehouseId} className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-3">
              {g.storehouseId === 1 ? "GVM (Main)" : "VEN (Branch)"}
            </h2>

            {g.items.length === 0 && <div className="text-sm text-gray-500">No stock</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {g.items.map((it) => (
                <div key={`${it.storehouse_id}-${it.product_id}`} className="flex items-center gap-3 p-2 border rounded">
                  <div className="w-14 h-14 flex items-center justify-center bg-gray-50 rounded">
                    {it.product_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={it.product_image} alt={it.product_name ?? ""} className="max-h-12" />
                    ) : (
                      <div className="text-xs text-gray-400">no image</div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="font-medium">{it.product_name ?? `Product ${it.product_id}`}</div>
                    <div className="text-sm text-gray-500">ID: {it.product_id}</div>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold">{it.quantity}</div>
                    <div className="text-xs text-gray-500">units</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
    </main>
  );
}
