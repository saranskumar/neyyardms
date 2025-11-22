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
