"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { money } from "@/lib/utils/index";

type TripSummary = {
  id: number;
  trip_date: string;
  salesman: string;
  route: string;
  shops_visited: number;
  revenue: number | null;
  cash: number | null;
};

type Payment = { id: number; shop_id: number; amount: number; created_at: string };
type Expense = { id: number; amount: number; category: string; spent_by: string; created_at: string };

export default function SettlementPage() {
  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    setLoading(true);
    const t = await supabase.from("view_trip_summary").select("*");
    const p = await supabase.from("payments").select("*");
    const e = await supabase.from("expenses").select("*");

    if (!t.error) setTrips(t.data as TripSummary[]);
    if (!p.error) setPayments(p.data as Payment[]);
    if (!e.error) setExpenses(e.data as Expense[]);

    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  const totalRevenue = trips.reduce((s, t) => s + (t.revenue ?? 0), 0);
  const totalCash = trips.reduce((s, t) => s + (t.cash ?? 0), 0);
  const totalPayments = payments.reduce((s, p) => s + (p.amount ?? 0), 0);
  const totalExpenses = expenses.reduce((s, ex) => s + (ex.amount ?? 0), 0);

  return (
    <main className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Cash Settlement Summary</h1>

      {loading && <div>Loading…</div>}

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Total Revenue (period)</div>
          <div className="text-xl font-semibold">{money(totalRevenue)}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Total Cash Collected</div>
          <div className="text-xl font-semibold">{money(totalCash)}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Payments (manual collection)</div>
          <div className="text-xl font-semibold">{money(totalPayments)}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Expenses</div>
          <div className="text-xl font-semibold">{money(totalExpenses)}</div>
        </div>
      </section>

      <section className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-3">Trips</h2>
        <div className="space-y-2">
          {trips.map((t) => (
            <div key={t.id} className="flex justify-between items-center p-2 border rounded">
              <div>
                <div className="font-medium">{t.route} — {t.salesman}</div>
                <div className="text-sm text-gray-500">{new Date(t.trip_date).toLocaleDateString()}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{money(t.revenue ?? 0)}</div>
                <div className="text-sm text-gray-500">Cash: {money(t.cash ?? 0)}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Recent Payments</h3>
          <ul className="space-y-2">
            {payments.slice().reverse().slice(0, 10).map((p) => (
              <li key={p.id} className="flex justify-between">
                <div>Shop {p.shop_id}</div>
                <div>{money(p.amount)}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Recent Expenses</h3>
          <ul className="space-y-2">
            {expenses.slice().reverse().slice(0, 10).map((ex) => (
              <li key={ex.id} className="flex justify-between">
                <div>{ex.category}</div>
                <div>{money(ex.amount)}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
