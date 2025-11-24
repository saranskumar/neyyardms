"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { makeSale } from "@/lib/rpc";
import { queueTransaction } from "@/lib/offlineQueue";
import { isOnline, toast } from "@/lib/utils/index";
import CartView from "./components/Cart";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/lib/useUser";
import { ArrowLeft, Search, Store } from "lucide-react";
import Link from "next/link";

export default function POSPage() {
  const user = useUser();
  const [cart, setCart] = useState<any[]>([]);
  const [storehouseId, setStorehouseId] = useState(2); // Default storehouse
  const [selectedShop, setSelectedShop] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch Products
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true);
      return data || [];
    },
  });

  // Fetch Shops
  const { data: shops = [] } = useQuery({
    queryKey: ["shops"],
    queryFn: async () => {
      const { data } = await supabase
        .from("shops")
        .select("id, name")
        .eq("is_active", true);
      return data || [];
    },
  });

  // Fetch Today's Trip
  const { data: trip } = useQuery({
    queryKey: ["todaysTrip", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("trips")
        .select("*")
        .eq("salesman_id", user.id)
        .eq("trip_date", new Date().toISOString().split("T")[0])
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

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
    toast(`Added ${product.name}`);
  }

  async function checkout() {
    if (!selectedShop) return toast("Select shop first");
    if (cart.length === 0) return toast("Cart empty");

    const items = cart.map((c) => ({
      product_id: c.product.id,
      qty: c.qty,
      custom_price: null,
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
      cashCollected: revenue,
    };

    try {
      if (isOnline()) {
        const res = await makeSale(payload);
        if (!res.success) throw new Error(res.message || "Sale failed");
        toast("Sale completed");
      } else {
        await queueTransaction(payload);
        toast("Offline — queued");
      }
      setCart([]);
    } catch (err: any) {
      if (!isOnline()) {
        await queueTransaction(payload);
        toast("Offline — queued");
        setCart([]);
      } else {
        toast(err.message || "Error processing sale");
      }
    }
  }

  const filteredProducts = products.filter((p: any) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-4 sticky top-0 z-10">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-zinc-600 dark:text-zinc-400" />
          </Link>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">New Sale</h1>
        </div>

        {/* Shop Selector */}
        <div className="relative">
          <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <select
            className="w-full pl-10 pr-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl border-none outline-none focus:ring-2 focus:ring-violet-500 appearance-none"
            value={selectedShop ?? ""}
            onChange={(e) => setSelectedShop(Number(e.target.value))}
          >
            <option value="">Select a Shop</option>
            {shops.map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="flex-1 p-4 pb-32">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-violet-500 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.map((p: any) => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-violet-500 transition-colors text-left flex flex-col justify-between h-32 active:scale-95"
            >
              <span className="font-medium text-zinc-900 dark:text-white line-clamp-2">
                {p.name}
              </span>
              <div className="flex justify-between items-end mt-2">
                <span className="text-violet-600 font-bold">₹{p.default_selling_price}</span>
                <div className="h-8 w-8 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center text-violet-600 dark:text-violet-400">
                  +
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart Sheet / Bottom Bar */}
      <CartView cart={cart} setCart={setCart} onCheckout={checkout} />
    </main>
  );
}
