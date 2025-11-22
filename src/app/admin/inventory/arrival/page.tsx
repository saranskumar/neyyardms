"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/lib/utils";

type Product = {
  id: number;
  name: string;
};

export default function DailyArrival() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({
    product_id: "",
    total: "",
    damaged: "",
    gvm: "",
    ven: ""
  });

  async function loadProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("id, name");

    if (error) {
      console.error(error);
      toast("Failed to load products");
    } else {
      setProducts(data as Product[]);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function updateField(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit() {
    const { product_id, total, damaged, gvm, ven } = form;

    const { error } = await supabase.rpc("process_daily_arrival", {
      p_product_id: Number(product_id),
      p_total_incoming: Number(total),
      p_arrival_damaged: Number(damaged),
      p_split_gvm: Number(gvm),
      p_split_ven: Number(ven)
    });

    if (error) {
      toast(error.message);
    } else {
      toast("Arrival submitted");
      setForm({
        product_id: "",
        total: "",
        damaged: "",
        gvm: "",
        ven: ""
      });
    }
  }

  return (
    <main className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Daily Arrival</h1>

      <div className="bg-white p-4 rounded shadow space-y-3">
        <label>Product</label>
        <select
          value={form.product_id}
          onChange={(e) => updateField("product_id", e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="">Select product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <input
          placeholder="Total incoming"
          className="border p-2 rounded w-full"
          value={form.total}
          onChange={(e) => updateField("total", e.target.value)}
        />

        <input
          placeholder="Damaged"
          className="border p-2 rounded w-full"
          value={form.damaged}
          onChange={(e) => updateField("damaged", e.target.value)}
        />

        <input
          placeholder="GVM Split"
          className="border p-2 rounded w-full"
          value={form.gvm}
          onChange={(e) => updateField("gvm", e.target.value)}
        />

        <input
          placeholder="VEN Split"
          className="border p-2 rounded w-full"
          value={form.ven}
          onChange={(e) => updateField("ven", e.target.value)}
        />

        <button
          onClick={submit}
          className="w-full py-2 bg-violet-700 text-white rounded"
        >
          Submit Arrival
        </button>
      </div>
    </main>
  );
}
