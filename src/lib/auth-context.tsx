"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { useRouter } from "next/navigation";

interface AuthContextType {
    user: User | null;
    role: "admin" | "salesman" | null;
    defaultStorehouse: number | null;
    activeStorehouse: number | null;
    setActiveStorehouse: (id: number) => void;
    loading: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<"admin" | "salesman" | null>(null);
    const [defaultStorehouse, setDefaultStorehouse] = useState<number | null>(null);
    const [activeStorehouse, setActiveStorehouseState] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchUserProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchUserProfile(session.user.id);
            } else {
                setRole(null);
                setDefaultStorehouse(null);
                setActiveStorehouseState(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    async function fetchUserProfile(userId: string) {
        // Try to fetch with default_storehouse_id, but handle if column doesn't exist
        const { data, error } = await supabase
            .from("users")
            .select("role")
            .eq("id", userId)
            .single();

        if (data) {
            setRole(data.role as "admin" | "salesman");

            // Set default storehouse to VEN (id: 2) for salesmen
            const defaultStore = data.role === "salesman" ? 2 : null;
            setDefaultStorehouse(defaultStore);

            // Set active storehouse from session or default
            const savedStorehouse = sessionStorage.getItem("activeStorehouse");
            if (savedStorehouse) {
                setActiveStorehouseState(Number(savedStorehouse));
            } else if (defaultStore) {
                setActiveStorehouseState(defaultStore);
            }
        }
        setLoading(false);
    }

    function setActiveStorehouse(id: number) {
        setActiveStorehouseState(id);
        sessionStorage.setItem("activeStorehouse", id.toString());
    }

    async function logout() {
        await supabase.auth.signOut();
        sessionStorage.removeItem("activeStorehouse");
        router.push("/login");
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                role,
                defaultStorehouse,
                activeStorehouse,
                setActiveStorehouse,
                loading,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
