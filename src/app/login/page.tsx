"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/lib/utils/index";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Mail, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast(error.message);
      setLoading(false);
      return;
    }

    // Fetch user role and redirect accordingly
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", data.user.id)
      .single();

    // Role-based routing
    if (userData?.role === "admin") {
      router.push("/admin/dashboard");
    } else {
      router.push("/salesman/dashboard");
    }

    setLoading(false);
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "#F3F4F6" }}
    >
      <div className="w-full max-w-md">
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/icons/icon-192.png"
              alt="Neyyar Dairy Logo"
              width={80}
              height={80}
              className="rounded-2xl shadow-lg"
            />
          </div>
          <h1
            className="text-3xl font-bold tracking-tight mb-2"
            style={{ color: "#3E2758" }}
          >
            Neyyar Dairy
          </h1>
          <p className="text-zinc-600">Management System</p>
        </div>

        {/* Login Card */}
        <div
          className="p-8 rounded-3xl shadow-2xl"
          style={{ backgroundColor: "#FFFFFF" }}
        >
          <form onSubmit={login} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label
                className="text-xs font-medium ml-1 uppercase tracking-wider"
                style={{ color: "#3E2758" }}
              >
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  size={20}
                  style={{ color: "#3E2758", opacity: 0.5 }}
                />
                <input
                  className="w-full border-2 rounded-xl py-3.5 pl-12 pr-4 text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition-all"
                  style={{
                    borderColor: "#E5E7EB",
                    backgroundColor: "#F9FAFB"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#3E2758"}
                  onBlur={(e) => e.target.style.borderColor = "#E5E7EB"}
                  placeholder="name@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label
                className="text-xs font-medium ml-1 uppercase tracking-wider"
                style={{ color: "#3E2758" }}
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  size={20}
                  style={{ color: "#3E2758", opacity: 0.5 }}
                />
                <input
                  className="w-full border-2 rounded-xl py-3.5 pl-12 pr-4 text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition-all"
                  style={{
                    borderColor: "#E5E7EB",
                    backgroundColor: "#F9FAFB"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#3E2758"}
                  onBlur={(e) => e.target.style.borderColor = "#E5E7EB"}
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-lg text-white transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6 shadow-lg hover:shadow-xl"
              style={{
                backgroundColor: "#3E2758",
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#2D1D42"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#3E2758"}
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-zinc-500 text-sm mt-8">
          &copy; {new Date().getFullYear()} Sahya's Neyyar Dairy
        </p>
      </div>
    </main>
  );
}
