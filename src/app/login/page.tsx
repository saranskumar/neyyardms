"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/lib/utils/index";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    if (!email || !password) return toast("Fill all fields");

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    setLoading(false);

    if (error) {
      toast(error.message);
      return;
    }

    toast("Logged in");

    // Check role from public.users (your DB)
    const userId = data.user?.id;
    const { data: userRow } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (userRow?.role === "admin") router.push("/admin");
    else router.push("/dashboard");
  }

  return (
    <main className="p-4 flex flex-col items-center justify-center min-h-screen">
      <div className="bg-white p-6 rounded shadow max-w-sm w-full space-y-4">
        <h1 className="text-2xl font-bold text-center">Login</h1>

        <input
          className="border p-2 rounded w-full"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="border p-2 rounded w-full"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={login}
          disabled={loading}
          className="w-full py-2 bg-violet-700 text-white rounded disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </main>
  );
}
