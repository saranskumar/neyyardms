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
