"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { reportDamage as rpcReport } from "@/lib/rpc";
import type { RpcResult } from "@/lib/utils";
import { toast } from "@/lib/utils";

type Product = { id: number; name: string };

type DamagePayload = {
  storehouseId: number;
  productId: number;
  qty: number;
  reason: string;
  type: string;
};

export default function DamageReportPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [storehouseId, setStorehouseId] = useState<number>(1);
  const [productId, setProductId] = useState<number | "">("");
  const [qty, setQty] = useState<number>(0);
  const [reason, setReason] = useState<string>("");
  const [type, setType] = useState<string>("transport");

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      const { data, error } = await supabase.from("products").select("id, name");
      if (error) {
        console.error("Failed to load products:", error);
        toast("Failed to load products");
        if (mounted) setProducts([]);
        return;
      }
      if (mounted) setProducts(data as Product[]);
    };

    loadProducts();
    return () => {
      mounted = false;
    };
  }, []);

  async function submit() {
    if (!productId) return toast("Select a product");
    if (!qty || qty <= 0) return toast("Enter a valid quantity");

    const payload: DamagePayload = {
      storehouseId,
      productId: Number(productId),
      qty,
      reason,
      type
    };

    const res: RpcResult<any> = await rpcReport(payload);

    if (!res.success) {
      console.error(res.message);
      return toast(res.message ?? "Failed to report damage");
    }

    toast("Damage reported");

    // Reset fields
    setProductId("");
    setQty(0);
    setReason("");
    setType("transport");
  }

  return (
    <main className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Report Damage / Leakage</h1>

      <section className="bg-white p-4 rounded shadow space-y-3 max-w-lg">
        <label className="block font-medium">Storehouse</label>
        <select
          value={storehouseId}
          onChange={(e) => setStorehouseId(Number(e.target.value))}
          className="border p-2 rounded w-full"
        >
          <option value={1}>GVM (Main)</option>
          <option value={2}>VEN (Branch)</option>
        </select>

        <label className="block font-medium">Product</label>
        <select
          value={productId}
          onChange={(e) =>
            setProductId(e.target.value === "" ? "" : Number(e.target.value))
          }
          className="border p-2 rounded w-full"
        >
          <option value="">Select product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <label className="block font-medium">Quantity</label>
        <input
          type="number"
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          className="border p-2 rounded w-full"
          min={1}
        />

        <label className="block font-medium">Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="arrival">arrival</option>
          <option value="leakage">leakage</option>
          <option value="transport">transport</option>
          <option value="reconciliation_loss">reconciliation_loss</option>
        </select>

        <label className="block font-medium">Reason / Notes</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="border p-2 rounded w-full"
          rows={3}
        />

        <button
          className="py-2 px-4 bg-violet-700 text-white rounded"
          onClick={submit}
        >
          Report Damage
        </button>
      </section>
    </main>
  );
}
