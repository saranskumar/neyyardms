"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { MapPin, Plus, Edit, X } from "lucide-react";
import { toast } from "@/lib/utils";

interface Route {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
}

export default function RoutesPage() {
    const [showModal, setShowModal] = useState(false);
    const [editingRoute, setEditingRoute] = useState<Route | null>(null);
    const queryClient = useQueryClient();

    const { data: routes, isLoading } = useQuery({
        queryKey: ["routes"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("routes")
                .select("*")
                .order("name");
            if (error) throw error;
            return data as Route[];
        }
    });

    const createMutation = useMutation({
        mutationFn: async (route: Partial<Route>) => {
            const { data, error } = await supabase
                .from("routes")
                .insert([route])
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["routes"] });
            toast("Route created successfully");
            setShowModal(false);
        },
        onError: (error: any) => {
            toast(error.message || "Failed to create route");
        }
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, ...route }: Partial<Route> & { id: number }) => {
            const { data, error } = await supabase
                .from("routes")
                .update(route)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["routes"] });
            toast("Route updated successfully");
            setShowModal(false);
            setEditingRoute(null);
        },
        onError: (error: any) => {
            toast(error.message || "Failed to update route");
        }
    });



    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: "#3E2758" }}>Routes</h1>
                    <p className="text-zinc-500">Manage delivery routes</p>
                </div>
                <button
                    onClick={() => {
                        setEditingRoute(null);
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90"
                    style={{ backgroundColor: "#3E2758" }}
                >
                    <Plus size={20} />
                    Add Route
                </button>
            </div>

            <div className="bg-white rounded-xl border border-zinc-200 p-6">
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: "#3E2758" }}></div>
                    </div>
                ) : routes && routes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {routes.map((route) => (
                            <div key={route.id} className="border border-zinc-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-bold" style={{ color: "#3E2758" }}>{route.name}</h3>
                                        {route.description && (
                                            <p className="text-sm text-zinc-500 mt-1">{route.description}</p>
                                        )}
                                        <span
                                            className={`inline-block px-2 py-1 rounded-full text-xs mt-2 ${route.is_active ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-600"
                                                }`}
                                        >
                                            {route.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setEditingRoute(route);
                                            setShowModal(true);
                                        }}
                                        className="p-2 hover:bg-zinc-100 rounded-lg"
                                    >
                                        <Edit size={16} style={{ color: "#3E2758" }} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <MapPin className="mx-auto mb-4 text-zinc-300" size={48} />
                        <p className="text-zinc-500">No routes yet</p>
                        <p className="text-sm text-zinc-400 mt-1">Click "Add Route" to create a delivery route</p>
                    </div>
                )}
            </div>

            {showModal && (
                <RouteModal
                    route={editingRoute}
                    onClose={() => {
                        setShowModal(false);
                        setEditingRoute(null);
                    }}
                    onSave={(route) => {
                        if (editingRoute) {
                            updateMutation.mutate({ ...route, id: editingRoute.id });
                        } else {
                            createMutation.mutate(route);
                        }
                    }}
                />
            )}
        </div>
    );
}

function RouteModal({
    route,
    onClose,
    onSave
}: {
    route: Route | null;
    onClose: () => void;
    onSave: (route: Partial<Route>) => void;
}) {
    const [formData, setFormData] = useState({
        name: route?.name || "",
        description: route?.description || "",
        is_active: route?.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold" style={{ color: "#3E2758" }}>
                        {route ? "Edit Route" : "Add Route"}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "#3E2758" }}>
                            Route Name
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full border border-zinc-300 rounded-lg px-3 py-2 outline-none focus:border-violet-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "#3E2758" }}>
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full border border-zinc-300 rounded-lg px-3 py-2 outline-none focus:border-violet-500"
                            rows={3}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="rounded"
                        />
                        <label htmlFor="is_active" className="text-sm">Active</label>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-zinc-300 rounded-lg font-medium hover:bg-zinc-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90"
                            style={{ backgroundColor: "#3E2758" }}
                        >
                            {route ? "Update" : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
