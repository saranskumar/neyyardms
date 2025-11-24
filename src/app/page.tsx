"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in - go to login
        router.push("/login");
      } else if (role === "admin") {
        // Admin user - go to admin dashboard
        router.push("/admin/dashboard");
      } else if (role === "salesman") {
        // Salesman user - go to salesman dashboard
        router.push("/salesman/dashboard");
      } else {
        // Unknown role - go to login
        router.push("/login");
      }
    }
  }, [user, role, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
    </div>
  );
}
