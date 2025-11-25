"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Users, Plus, X, UserPlus, Phone } from "lucide-react";

interface User {
    id: string;
    email: string;
    full_name: string;
    phone_number: string | null;
    role: "admin" | "salesman";
    default_storehouse_id: number | null;
    created_at: string;
}

export default function UsersPage() {
    const [showModal, setShowModal] = useState(false);

    const { data: users, isLoading } = useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("users")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data as User[];
        }
    });

    const admins = users?.filter(u => u.role === "admin") || [];
    const salesmen = users?.filter(u => u.role === "salesman") || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: "#3E2758" }}>Users</h1>
                    <p className="text-zinc-500">Manage admin and salesman accounts</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90"
                    style={{ backgroundColor: "#3E2758" }}
                >
                    <Plus size={20} />
                    Add User
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-zinc-200 p-6">
                    <p className="text-sm text-zinc-500">Administrators</p>
                    <p className="text-3xl font-bold mt-2" style={{ color: "#3E2758" }}>{admins.length}</p>
                </div>
                <div className="bg-white rounded-xl border border-zinc-200 p-6">
                    <p className="text-sm text-zinc-500">Salesmen</p>
                    <p className="text-3xl font-bold mt-2" style={{ color: "#3E2758" }}>{salesmen.length}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-zinc-200 p-6">
                <h3 className="font-bold mb-4" style={{ color: "#3E2758" }}>All Users</h3>
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: "#3E2758" }}></div>
                    </div>
                ) : users && users.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-zinc-200">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-600">Name</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-600">Email</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-600">Phone</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-600">Role</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-600">Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                                        <td className="py-3 px-4 text-sm font-medium" style={{ color: "#3E2758" }}>
                                            {user.full_name}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-zinc-600">
                                            {user.email}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-zinc-600">
                                            {user.phone_number ? (
                                                <div className="flex items-center gap-1">
                                                    <Phone size={14} className="text-zinc-400" />
                                                    {user.phone_number}
                                                </div>
                                            ) : (
                                                <span className="text-zinc-400">-</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-block px-2 py-1 rounded-full text-xs ${user.role === "admin"
                                                    ? "bg-purple-100 text-purple-700"
                                                    : "bg-blue-100 text-blue-700"
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-zinc-500">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <UserPlus className="mx-auto mb-4 text-zinc-300" size={48} />
                        <p className="text-zinc-500">No users yet</p>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold" style={{ color: "#3E2758" }}>Add User</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-zinc-100 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="text-center py-8">
                            <UserPlus className="mx-auto mb-4 text-zinc-300" size={48} />
                            <p className="text-zinc-500 mb-2">User creation via Supabase Auth</p>
                            <p className="text-sm text-zinc-400">
                                Create users in Supabase Dashboard → Authentication → Users
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
