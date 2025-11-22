Write-Host "Scaffolding full app structure..."

# ensure directories
New-Item -ItemType Directory -Force -Path "src/app/dashboard" | Out-Null
New-Item -ItemType Directory -Force -Path "src/app/route" | Out-Null
New-Item -ItemType Directory -Force -Path "src/app/shop/[id]" | Out-Null
New-Item -ItemType Directory -Force -Path "src/app/admin" | Out-Null
New-Item -ItemType Directory -Force -Path "src/components" | Out-Null

# Dashboard page
$dash = @'
import React from "react";

export default function Dashboard() {
  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">Incoming Stock (card)</div>
        <div className="bg-white p-4 rounded shadow">Today Sales (card)</div>
        <div className="bg-white p-4 rounded shadow">Cash Collected (card)</div>
      </div>
    </main>
  );
}
'@
Set-Content -Path "src/app/dashboard/page.tsx" -Value $dash -Encoding UTF8 -Force

# Route page
$route = @'
"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function RouteList() {
  const [shops, setShops] = useState([]);

  useEffect(() => { fetchShops(); }, []);

  async function fetchShops() {
    const { data, error } = await supabase.from("view_shop_debt").select("*");
    if (!error) setShops(data || []);
  }

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Route / Shops</h1>
      <div className="space-y-3">
        {shops.map((s) => (
          <Link key={s.id} href={`/shop/${s.id}`} className="block p-3 bg-white rounded shadow flex justify-between items-center">
              <div>
                <div className="font-medium">{s.name}</div>
                <div className="text-sm text-gray-500">
                  {s.last_sale_date ? new Date(s.last_sale_date).toLocaleString() : "No recent sales"}
                </div>
              </div>
              <div className={s.current_balance > 0 ? "text-red-600 font-semibold" : "text-green-600 font-semibold"}>
                ₹{s.current_balance}
              </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
'@
Set-Content -Path "src/app/route/page.tsx" -Value $route -Encoding UTF8 -Force

# Shop page
$shop = @'
"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ShopPage({ params }) {
  const { id } = params;
  const [shop, setShop] = useState(null);

  useEffect(() => { loadShop(); }, [id]);

  async function loadShop() {
    const { data } = await supabase.from("shops").select("*").eq("id", id).single();
    setShop(data);
  }

  if (!shop) return <div className="p-4">Loading...</div>;

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold">{shop.name}</h1>
      <div className="text-gray-600 mb-4">Balance: ₹{shop.current_balance}</div>

      <div className="space-x-2 mb-6">
        <Link href="/pos" className="px-3 py-2 bg-violet-700 text-white rounded">Open POS</Link>
        <button className="px-3 py-2 bg-yellow-400 rounded">Collect Payment</button>
      </div>

      <div className="bg-white p-4 shadow rounded">
        <h2 className="font-semibold mb-2">History</h2>
        <div>History view coming soon…</div>
      </div>
    </main>
  );
}
'@
Set-Content -Path "src/app/shop/[id]/page.tsx" -Value $shop -Encoding UTF8 -Force

# Admin
$admin = @'
import Link from "next/link";

export default function Admin() {
  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/admin/inventory" className="p-3 bg-white rounded shadow">Inventory</Link>
        <Link href="/admin/trips" className="p-3 bg-white rounded shadow">Trips</Link>
      </div>
    </main>
  );
}
'@
Set-Content -Path "src/app/admin/page.tsx" -Value $admin -Encoding UTF8 -Force

# Admin inventory
New-Item -ItemType Directory -Force -Path "src/app/admin/inventory" | Out-Null
$inv = @'
export default function Inventory() {
  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Inventory</h1>
      <div className="bg-white p-4 rounded shadow">Inventory management coming soon</div>
    </main>
  );
}
'@
Set-Content -Path "src/app/admin/inventory/page.tsx" -Value $inv -Encoding UTF8 -Force

# Admin trips
New-Item -ItemType Directory -Force -Path "src/app/admin/trips" | Out-Null
$trips = @'
export default function Trips() {
  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Trips</h1>
      <div className="bg-white p-4 rounded shadow">Trips manager coming soon</div>
    </main>
  );
}
'@
Set-Content -Path "src/app/admin/trips/page.tsx" -Value $trips -Encoding UTF8 -Force

# Header component (no layout injection)
$header = @'
import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white shadow p-3">
      <nav className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="font-bold">Neyyar Dairy</div>
        <div className="flex gap-4 text-sm">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/route">Route</Link>
          <Link href="/pos">POS</Link>
          <Link href="/admin">Admin</Link>
        </div>
      </nav>
    </header>
  );
}
'@
Set-Content -Path "src/components/Header.tsx" -Value $header -Encoding UTF8 -Force

Write-Host "Scaffold complete. MANUALLY edit layout.tsx to add <Header />."
