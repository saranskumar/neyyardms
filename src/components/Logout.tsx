"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LogoutBtn() {
  const router = useRouter();

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <button onClick={logout} className="text-red-600">
      Logout
    </button>
  );
}
