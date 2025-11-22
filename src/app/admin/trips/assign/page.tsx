"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/lib/utils";

type Route = { id: number; name: string };
type Salesman = { id: string; full_name: string };

export default function TripAssign() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [salesmen, setSalesmen] = useState<Salesman[]>([]);
  const [form, setForm] = useState({
    route_id: "",
    salesman_id: "",
    vehicle_number: ""
  });

  async function loadData() {
    const r = await supabase.from("routes").select("id, name");
    const u = await supabase.from("users").select("id, full_name").eq("role", "salesman");

    if (!r.error) setRoutes(r.data as Route[]);
    if (!u.error) setSalesmen(u.data as Salesman[]);
  }

  useEffect(() => {
    loadData();
  }, []);

  function setField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function createTrip() {
    const { route_id, salesman_id, vehicle_number } = form;

    const { error } = await supabase.from("trips").insert({
      route_id: Number(route_id),
      salesman_id: salesman_id,
      vehicle_number: vehicle_number,
      trip_date: new Date().toISOString().split("T")[0]
    });

    if (error) toast(error.message);
    else toast("Trip created");
  }

  return (
    <main className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Trip Assignment</h1>

      <div className="bg-white p-4 rounded shadow space-y-3">
        <label>Route</label>
        <select
          className="border p-2 rounded w-full"
          value={form.route_id}
          onChange={(e) => setField("route_id", e.target.value)}
        >
          <option value="">Select Route</option>
          {routes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>

        <label>Salesman</label>
        <select
          className="border p-2 rounded w-full"
          value={form.salesman_id}
          onChange={(e) => setField("salesman_id", e.target.value)}
        >
          <option value="">Select Salesman</option>
          {salesmen.map((s) => (
            <option key={s.id} value={s.id}>
              {s.full_name}
            </option>
          ))}
        </select>

        <input
          placeholder="Vehicle Number"
          className="border p-2 rounded w-full"
          value={form.vehicle_number}
          onChange={(e) => setField("vehicle_number", e.target.value)}
        />

        <button
          onClick={createTrip}
          className="w-full py-2 bg-violet-700 text-white rounded"
        >
          Assign Trip
        </button>
      </div>
    </main>
  );
}
