"use client";

import { Users, Plus, UserPlus } from "lucide-react";

export default function UsersPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: "#3E2758" }}>Users</h1>
                    <p className="text-zinc-500">Manage admin and salesman accounts</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium" style={{ backgroundColor: "#3E2758" }}>
                    <Plus size={20} />
                    Add User
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-zinc-200 p-6">
                    <p className="text-sm text-zinc-500">Administrators</p>
                    <p className="text-3xl font-bold mt-2" style={{ color: "#3E2758" }}>0</p>
                </div>
                <div className="bg-white rounded-xl border border-zinc-200 p-6">
                    <p className="text-sm text-zinc-500">Salesmen</p>
                    <p className="text-3xl font-bold mt-2" style={{ color: "#3E2758" }}>0</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-zinc-200 p-6">
                <div className="text-center py-12">
                    <UserPlus className="mx-auto mb-4 text-zinc-300" size={48} />
                    <p className="text-zinc-500">No users yet</p>
                    <p className="text-sm text-zinc-400 mt-1">Click "Add User" to invite team members</p>
                </div>
            </div>
        </div>
    );
}
