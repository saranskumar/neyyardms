"use client";

import { useUser } from "@/lib/useUser";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user === null) router.push("/login");
  }, [user]);

  if (!user) return <div className="p-4">Checking session…</div>;
  return <>{children}</>;
}
