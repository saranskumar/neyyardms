"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Package, Plus, Search, Edit, X } from "lucide-react";
import { toast } from "@/lib/utils";

interface Product {
    id: number;
    name: string;
    image_url: string | null;
    default_cost_price: number;
    default_selling_price: number;
    is_active: boolean;
}

export default function ProductsContent() {
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const queryClient = useQueryClient();

    const { data: products, isLoading } = useQuery({
        queryKey: ["products"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("products")
                .select("*")
                .order("name");
            if (error) throw error;
            return data as Product[];
        }
    });

    const createMutation = useMutation({
        mutationFn: async (product: Partial<Product>) => {
            const { data, error } = await supabase
                .from("products")
                .insert([product])
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            toast("Product created successfully");
            setShowModal(false);
        },
        onError: (error: any) => {
            toast(error.message || "Failed to create product");
        }
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, ...product }: Partial<Product> & { id: number }) => {
            const { data, error } = await supabase
                .from("products")
                .update(product)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            toast("Product updated successfully");
            setShowModal(false);
            setEditingProduct(null);
        },
        onError: (error: any) => {
            toast(error.message || "Failed to update product");
        }
    });



    const filteredProducts = products?.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 max-w-md">
                    <Search className="text-zinc-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 outline-none text-zinc-900 bg-transparent"
                    />
                </div>
                <button
                    onClick={() => {
                        setEditingProduct(null);
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90"
                    style={{ backgroundColor: "#3E2758" }}
                >
                    <Plus size={20} />
                    Add Product
                </button>
            </div>

            <div className="bg-white rounded-xl border border-zinc-200 p-6">
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: "#3E2758" }}></div>
                    </div>
                ) : filteredProducts && filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredProducts.map((product) => (
                            <div key={product.id} className="border border-zinc-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-bold" style={{ color: "#3E2758" }}>{product.name}</h3>
                                        <div className="mt-2 space-y-1">
                                            <p className="text-sm text-zinc-600">Cost: ₹{product.default_cost_price}</p>
                                            <p className="text-sm text-zinc-600">Sell: ₹{product.default_selling_price}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setEditingProduct(product);
                                                setShowModal(true);
                                            }}
                                            className="p-2 hover:bg-zinc-100 rounded-lg"
                                        >
                                            <Edit size={16} style={{ color: "#3E2758" }} />
                                        </button>
                                    </div>
                                </div>
                                <span
                                    className={`inline-block px-2 py-1 rounded-full text-xs ${product.is_active ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-600"
                                        }`}
                                >
                                    {product.is_active ? "Active" : "Inactive"}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Package className="mx-auto mb-4 text-zinc-300" size={48} />
                        <p className="text-zinc-500">No products found</p>
                    </div>
                )}
            </div>

            {showModal && (
                <ProductModal
                    product={editingProduct}
                    onClose={() => {
                        setShowModal(false);
                        setEditingProduct(null);
                    }}
                    onSave={(product) => {
                        if (editingProduct) {
                            updateMutation.mutate({ ...product, id: editingProduct.id });
                        } else {
                            createMutation.mutate(product);
                        }
                    }}
                />
            )}
        </div>
    );
}

function ProductModal({
    product,
    onClose,
    onSave
}: {
    product: Product | null;
    onClose: () => void;
    onSave: (product: Partial<Product>) => void;
}) {
    const [formData, setFormData] = useState({
        name: product?.name || "",
        default_cost_price: product?.default_cost_price || 0,
        default_selling_price: product?.default_selling_price || 0,
        is_active: product?.is_active ?? true,
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
                        {product ? "Edit Product" : "Add Product"}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "#3E2758" }}>
                            Product Name
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full border border-zinc-300 rounded-lg px-3 py-2 outline-none focus:border-violet-500"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: "#3E2758" }}>
                                Cost Price (₹)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.default_cost_price}
                                onChange={(e) => setFormData({ ...formData, default_cost_price: parseFloat(e.target.value) })}
                                className="w-full border border-zinc-300 rounded-lg px-3 py-2 outline-none focus:border-violet-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: "#3E2758" }}>
                                Selling Price (₹)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.default_selling_price}
                                onChange={(e) => setFormData({ ...formData, default_selling_price: parseFloat(e.target.value) })}
                                className="w-full border border-zinc-300 rounded-lg px-3 py-2 outline-none focus:border-violet-500"
                                required
                            />
                        </div>
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
                            {product ? "Update" : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
