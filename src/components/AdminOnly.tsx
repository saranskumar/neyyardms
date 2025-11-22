"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminOnly({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    async function check() {
      const session = await supabase.auth.getSession();
      const userId = session.data.session?.user?.id;

      if (!userId) return router.push("/login");

      const { data } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .single();

      if (!data || data.role !== "admin") router.push("/dashboard");
      else setRole("admin");
    }
    check();
  }, []);

  if (!role) return <div className="p-4">Checking access…</div>;
  return <>{children}</>;
}
