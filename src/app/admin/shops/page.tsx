"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Store, Plus, Search, Edit, Trash2, X, GripVertical } from "lucide-react";
import { toast } from "@/lib/utils";

interface Shop {
    id: number;
    name: string;
    image_url: string | null;
    current_balance: number;
    price_overrides: Record<string, number>;
    route_id: number | null;
    route_order: number | null;
    is_active: boolean;
}

interface Route {
    id: number;
    name: string;
}

export default function ShopsPage() {
    const [showModal, setShowModal] = useState(false);
    const [editingShop, setEditingShop] = useState<Shop | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const queryClient = useQueryClient();

    const { data: shops, isLoading } = useQuery({
        queryKey: ["shops"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("shops")
                .select("*")
                .order("route_order", { ascending: true, nullsFirst: false });
            if (error) throw error;
            return data as Shop[];
        }
    });

    const { data: routes } = useQuery({
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
        mutationFn: async (shop: Partial<Shop>) => {
            const { data, error } = await supabase
                .from("shops")
                .insert([shop])
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shops"] });
            toast("Shop created successfully");
            setShowModal(false);
        },
        onError: (error: any) => {
            toast(error.message || "Failed to create shop");
        }
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, ...shop }: Partial<Shop> & { id: number }) => {
            const { data, error } = await supabase
                .from("shops")
                .update(shop)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shops"] });
            toast("Shop updated successfully");
            setShowModal(false);
            setEditingShop(null);
        },
        onError: (error: any) => {
            toast(error.message || "Failed to update shop");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const { error } = await supabase
                .from("shops")
                .delete()
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shops"] });
            toast("Shop deleted successfully");
        },
        onError: (error: any) => {
            toast(error.message || "Failed to delete shop");
        }
    });

    const filteredShops = shops?.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: "#3E2758" }}>Shops</h1>
                    <p className="text-zinc-500">Manage customer shops and routes</p>
                </div>
                <button
                    onClick={() => {
                        setEditingShop(null);
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: "#3E2758" }}
                >
                    <Plus size={20} />
                    Add Shop
                </button>
            </div>

            <div className="bg-white rounded-xl border border-zinc-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Search className="text-zinc-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search shops..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 outline-none text-zinc-900"
                    />
                </div>

                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: "#3E2758" }}></div>
                    </div>
                ) : filteredShops && filteredShops.length > 0 ? (
                    <div className="space-y-2">
                        {filteredShops.map((shop) => (
                            <div
                                key={shop.id}
                                className="flex items-center gap-4 p-4 border border-zinc-200 rounded-xl hover:shadow-md transition-shadow"
                            >
                                <GripVertical className="text-zinc-400 cursor-move" size={20} />
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-bold" style={{ color: "#3E2758" }}>{shop.name}</h3>
                                        {shop.route_order && (
                                            <span className="text-xs px-2 py-1 rounded-full bg-zinc-100 text-zinc-600">
                                                Order: {shop.route_order}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 mt-1">
                                        <p className={`text-sm ${shop.current_balance > 0 ? 'text-red-600 font-medium' : 'text-green-600'}`}>
                                            Balance: ₹{shop.current_balance.toLocaleString()}
                                        </p>
                                        {shop.route_id && (
                                            <p className="text-sm text-zinc-500">
                                                Route: {routes?.find(r => r.id === shop.route_id)?.name || "Unknown"}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setEditingShop(shop);
                                            setShowModal(true);
                                        }}
                                        className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
                                    >
                                        <Edit size={16} style={{ color: "#3E2758" }} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm("Delete this shop?")) {
                                                deleteMutation.mutate(shop.id);
                                            }
                                        }}
                                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} className="text-red-600" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Store className="mx-auto mb-4 text-zinc-300" size={48} />
                        <p className="text-zinc-500">No shops found</p>
                        <p className="text-sm text-zinc-400 mt-1">Click "Add Shop" to get started</p>
                    </div>
                )}
            </div>

            {showModal && (
                <ShopModal
                    shop={editingShop}
                    routes={routes || []}
                    onClose={() => {
                        setShowModal(false);
                        setEditingShop(null);
                    }}
                    onSave={(shop) => {
                        if (editingShop) {
                            updateMutation.mutate({ ...shop, id: editingShop.id });
                        } else {
                            createMutation.mutate(shop);
                        }
                    }}
                />
            )}
        </div>
    );
}

function ShopModal({
    shop,
    routes,
    onClose,
    onSave
}: {
    shop: Shop | null;
    routes: Route[];
    onClose: () => void;
    onSave: (shop: Partial<Shop>) => void;
}) {
    const [formData, setFormData] = useState({
        name: shop?.name || "",
        route_id: shop?.route_id || null,
        route_order: shop?.route_order || null,
        is_active: shop?.is_active ?? true,
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
                        {shop ? "Edit Shop" : "Add Shop"}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "#3E2758" }}>
                            Shop Name
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
                            Route
                        </label>
                        <select
                            value={formData.route_id || ""}
                            onChange={(e) => setFormData({ ...formData, route_id: e.target.value ? Number(e.target.value) : null })}
                            className="w-full border border-zinc-300 rounded-lg px-3 py-2 outline-none focus:border-violet-500"
                        >
                            <option value="">No Route</option>
                            {routes.map((route) => (
                                <option key={route.id} value={route.id}>
                                    {route.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "#3E2758" }}>
                            Route Order
                        </label>
                        <input
                            type="number"
                            value={formData.route_order || ""}
                            onChange={(e) => setFormData({ ...formData, route_order: e.target.value ? Number(e.target.value) : null })}
                            className="w-full border border-zinc-300 rounded-lg px-3 py-2 outline-none focus:border-violet-500"
                            placeholder="1, 2, 3..."
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
                            {shop ? "Update" : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
