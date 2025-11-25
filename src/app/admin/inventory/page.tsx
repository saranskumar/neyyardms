"use client";

import { useState } from "react";
import { Package, Box, TrendingUp, History } from "lucide-react";
import ProductsContent from "./products-content";
import StockContent from "./stock-content";
import ReceiveStockContent from "./receive-content";
import StockLogsContent from "./logs-content";

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<"products" | "stock" | "receive" | "logs">("products");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#3E2758" }}>Inventory Management</h1>
        <p className="text-zinc-500">Manage products, stock, and track history</p>
      </div>

      {/* Tabs - Grid Layout for Better Alignment */}
      <div className="bg-white rounded-xl border border-zinc-200 p-1">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
          <button
            onClick={() => setActiveTab("products")}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-medium transition-colors ${activeTab === "products"
                ? "text-white"
                : "text-zinc-600 hover:bg-zinc-50"
              }`}
            style={activeTab === "products" ? { backgroundColor: "#3E2758" } : {}}
          >
            <Package size={18} />
            <span className="text-sm">Products</span>
          </button>
          <button
            onClick={() => setActiveTab("stock")}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-medium transition-colors ${activeTab === "stock"
                ? "text-white"
                : "text-zinc-600 hover:bg-zinc-50"
              }`}
            style={activeTab === "stock" ? { backgroundColor: "#3E2758" } : {}}
          >
            <Box size={18} />
            <span className="text-sm">Stock</span>
          </button>
          <button
            onClick={() => setActiveTab("receive")}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-medium transition-colors ${activeTab === "receive"
                ? "text-white"
                : "text-zinc-600 hover:bg-zinc-50"
              }`}
            style={activeTab === "receive" ? { backgroundColor: "#3E2758" } : {}}
          >
            <TrendingUp size={18} />
            <span className="text-sm">Receive</span>
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-medium transition-colors ${activeTab === "logs"
                ? "text-white"
                : "text-zinc-600 hover:bg-zinc-50"
              }`}
            style={activeTab === "logs" ? { backgroundColor: "#3E2758" } : {}}
          >
            <History size={18} />
            <span className="text-sm">Logs</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div>
        {activeTab === "products" && <ProductsContent />}
        {activeTab === "stock" && <StockContent />}
        {activeTab === "receive" && <ReceiveStockContent />}
        {activeTab === "logs" && <StockLogsContent />}
      </div>
    </div>
  );
}
