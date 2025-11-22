"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { makeSale } from "@/lib/rpc";
import { queueTransaction } from "@/lib/offlineQueue";
import { isOnline, toast } from "@/lib/utils";
import CartView from "./components/Cart";



export default function POSPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [trip, setTrip] = useState<any | null>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [storehouseId, setStorehouseId] = useState(2);
  const [selectedShop, setSelectedShop] = useState<number | null>(null);

  useEffect(() => {
    loadProducts();
    loadShops();
    loadTodayTrip();
  }, []);

  async function loadProducts() {
    const { data } = await supabase.from("products").select("*").eq("is_active", true);
    setProducts(data || []);
  }

  async function loadShops() {
    const { data } = await supabase.from("shops").select("id, name").eq("is_active", true);
    setShops(data || []);
  }

  async function loadTodayTrip() {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    const { data } = await supabase
      .from("trips")
      .select("*")
      .eq("salesman_id", user.data.user.id)
      .eq("trip_date", new Date().toISOString().split("T")[0])
      .single();

    if (data) setTrip(data);
  }

  function addToCart(product: any) {
    setCart((prev) => {
      const idx = prev.findIndex((c) => c.product.id === product.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx].qty += 1;
        return copy;
      }
      return [...prev, { product, qty: 1 }];
    });
  }

  async function checkout() {
    if (!selectedShop) return toast("Select shop first");
    if (cart.length === 0) return toast("Cart empty");

    const items = cart.map((c) => ({
      product_id: c.product.id,
      qty: c.qty,
      custom_price: null
    }));

    const revenue = cart.reduce(
      (sum, c) => sum + c.product.default_selling_price * c.qty,
      0
    );

    const payload = {
      shopId: selectedShop,
      storehouseId,
      tripId: trip?.id ?? null,
      items,
      cashCollected: revenue
    };

    if (isOnline()) {
      try {
        const res = await makeSale(payload);
        if (res.error) throw res.error;
        toast("Sale completed");
        setCart([]);
      } catch (err) {
        await queueTransaction(payload);
        toast("Offline — queued");
      }
    } else {
      await queueTransaction(payload);
      toast("Offline — queued");
    }
  }

  return (
    <main className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Point of Sale</h1>

      {/* Shop Selector */}
      <div className="bg-white p-3 rounded shadow">
        <label className="block font-medium mb-1">Select Shop</label>
        <select
          className="border p-2 rounded w-full"
          value={selectedShop ?? ""}
          onChange={(e) => setSelectedShop(Number(e.target.value))}
        >
          <option value="">Choose a shop</option>
          {shops.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {products.map((p) => (
          <div key={p.id} className="bg-white p-3 rounded shadow">
            <div className="font-medium">{p.name}</div>
            <div className="text-gray-600">₹{p.default_selling_price}</div>
            <button
              className="mt-2 px-3 py-1 bg-violet-700 text-white rounded"
              onClick={() => addToCart(p)}
            >
              Add
            </button>
          </div>
        ))}
      </div>

      {/* Cart */}
      <CartView cart={cart} setCart={setCart} onCheckout={checkout} />
    </main>
  );
}
