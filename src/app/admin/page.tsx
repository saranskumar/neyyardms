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
