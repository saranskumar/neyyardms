"use client";

import { Package, Plus, RefreshCw } from "lucide-react";

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#3E2758" }}>Inventory</h1>
          <p className="text-zinc-500">Manage stock across storehouses</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium" style={{ backgroundColor: "#3E2758" }}>
          <Plus size={20} />
          Receive Stock
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h3 className="font-bold mb-4" style={{ color: "#3E2758" }}>GVM - Govindamangalam</h3>
          <div className="text-center py-8">
            <Package className="mx-auto mb-2 text-zinc-300" size={40} />
            <p className="text-zinc-500 text-sm">No inventory</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h3 className="font-bold mb-4" style={{ color: "#3E2758" }}>VEN - Vengannor</h3>
          <div className="text-center py-8">
            <Package className="mx-auto mb-2 text-zinc-300" size={40} />
            <p className="text-zinc-500 text-sm">No inventory</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <div className="text-center py-12">
          <RefreshCw className="mx-auto mb-4 text-zinc-300" size={48} />
          <p className="text-zinc-500">No stock movements yet</p>
          <p className="text-sm text-zinc-400 mt-1">Click "Receive Stock" to add inventory</p>
        </div>
      </div>
    </div>
  );
}
