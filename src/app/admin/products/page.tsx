"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/lib/utils/index";

type Product = {
  id?: number;
  name: string;
  default_selling_price: number;
  default_cost_price?: number;
  image_url?: string | null;
  is_active?: boolean;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Product>({ name: "", default_selling_price: 0, default_cost_price: 0, image_url: "", is_active: true });
  const [editingId, setEditingId] = useState<number | null>(null);

  async function loadProducts() {
    setLoading(true);
    const { data, error } = await supabase.from("products").select("*").order("id", { ascending: false });
    if (error) {
      console.error(error);
      toast("Failed to load products");
      setProducts([]);
    } else {
      setProducts(data as Product[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function setField<K extends keyof Product>(k: K, v: Product[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save() {
    try {
      if (editingId) {
        const { error } = await supabase.from("products").update({
          name: form.name,
          default_selling_price: form.default_selling_price,
          default_cost_price: form.default_cost_price,
          image_url: form.image_url,
          is_active: form.is_active
        }).eq("id", editingId);

        if (error) {
          toast(error.message);
          return;
        }
        toast("Product updated");
      } else {
        const { error } = await supabase.from("products").insert({
          name: form.name,
          default_selling_price: form.default_selling_price,
          default_cost_price: form.default_cost_price,
          image_url: form.image_url,
          is_active: form.is_active
        });

        if (error) {
          toast(error.message);
          return;
        }
        toast("Product created");
      }
      setForm({ name: "", default_selling_price: 0, default_cost_price: 0, image_url: "", is_active: true });
      setEditingId(null);
      loadProducts();
    } catch (err) {
      console.error(err);
      toast("Failed to save product");
    }
  }

  function editProduct(p: Product) {
    setEditingId(p.id ?? null);
    setForm({
      name: p.name,
      default_selling_price: p.default_selling_price,
      default_cost_price: p.default_cost_price ?? 0,
      image_url: p.image_url ?? "",
      is_active: p.is_active ?? true
    });
  }

  async function removeProduct(id?: number) {
    if (!id) return;
    const confirmed = confirm("Delete product? This is irreversible.");
    if (!confirmed) return;

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast(error.message);
    } else {
      toast("Product deleted");
      loadProducts();
    }
  }

  return (
    <main className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Products</h1>

      <section className="bg-white p-4 rounded shadow max-w-2xl">
        <h2 className="font-semibold mb-3">{editingId ? "Edit Product" : "Add Product"}</h2>

        <input className="border p-2 rounded w-full mb-2" placeholder="Name" value={form.name} onChange={(e) => setField("name", e.target.value)} />
        <input type="number" className="border p-2 rounded w-full mb-2" placeholder="Selling price" value={form.default_selling_price} onChange={(e) => setField("default_selling_price", Number(e.target.value))} />
        <input type="number" className="border p-2 rounded w-full mb-2" placeholder="Cost price" value={form.default_cost_price} onChange={(e) => setField("default_cost_price", Number(e.target.value))} />
        <input className="border p-2 rounded w-full mb-2" placeholder="Image URL" value={form.image_url ?? ""} onChange={(e) => setField("image_url", e.target.value)} />
        <label className="flex items-center gap-2 mb-3">
          <input type="checkbox" checked={form.is_active} onChange={(e) => setField("is_active", e.target.checked)} />
          <span>Active</span>
        </label>

        <div className="flex gap-2">
          <button className="py-2 px-4 bg-violet-700 text-white rounded" onClick={save}>{editingId ? "Save" : "Create"}</button>
          {editingId && <button className="py-2 px-4 bg-gray-200 rounded" onClick={() => { setEditingId(null); setForm({ name: "", default_selling_price: 0, default_cost_price: 0, image_url: "", is_active: true }); }}>Cancel</button>}
        </div>
      </section>

      <section className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-3">Existing Products</h2>

        {loading && <div>Loading…</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {products.map((p) => (
            <div key={p.id} className="p-3 border rounded flex items-center justify-between">
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-gray-500">₹{p.default_selling_price} — cost ₹{p.default_cost_price ?? 0}</div>
              </div>

              <div className="flex gap-2">
                <button className="px-3 py-1 bg-gray-200 rounded" onClick={() => editProduct(p)}>Edit</button>
                <button className="px-3 py-1 text-red-600" onClick={() => removeProduct(p.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
