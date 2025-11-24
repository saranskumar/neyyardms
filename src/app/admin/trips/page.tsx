"use client";

import { Truck, Plus, Calendar } from "lucide-react";

export default function TripsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#3E2758" }}>Trips & Logistics</h1>
          <p className="text-zinc-500">Manage salesman trips and routes</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium" style={{ backgroundColor: "#3E2758" }}>
          <Plus size={20} />
          Create Trip
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <p className="text-sm text-zinc-500">Active Trips</p>
          <p className="text-3xl font-bold mt-2" style={{ color: "#3E2758" }}>0</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <p className="text-sm text-zinc-500">Completed Today</p>
          <p className="text-3xl font-bold mt-2" style={{ color: "#3E2758" }}>0</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <p className="text-sm text-zinc-500">Planned</p>
          <p className="text-3xl font-bold mt-2" style={{ color: "#3E2758" }}>0</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold" style={{ color: "#3E2758" }}>Recent Trips</h3>
          <button className="flex items-center gap-2 text-sm text-zinc-600">
            <Calendar size={16} />
            Filter
          </button>
        </div>
        <div className="text-center py-12">
          <Truck className="mx-auto mb-4 text-zinc-300" size={48} />
          <p className="text-zinc-500">No trips yet</p>
          <p className="text-sm text-zinc-400 mt-1">Click "Create Trip" to assign a salesman to a route</p>
        </div>
      </div>
    </div>
  );
}
