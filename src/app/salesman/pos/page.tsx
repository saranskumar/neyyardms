"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { ShoppingCart, Plus, Minus, Trash2, DollarSign, Store, X } from "lucide-react";
import { toast } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Product {
    id: number;
    name: string;
    default_cost_price: number;
    default_selling_price: number;
}

interface Shop {
    id: number;
    name: string;
}

interface CartItem {
    product_id: number;
    product_name: string;
    qty: number;
    custom_price: number | null;
    default_price: number;
}

export default function POSPage() {
    const { activeStorehouse, user } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [selectedShop, setSelectedShop] = useState<number | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [cashCollected, setCashCollected] = useState<number>(0);
    const [showProductModal, setShowProductModal] = useState(false);

    const { data: shops } = useQuery({
        queryKey: ["shops"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("shops")
                .select("id, name")
                .eq("is_active", true)
                .order("name");
            if (error) throw error;
            return data as Shop[];
        }
    });

    const { data: products } = useQuery({
        queryKey: ["products"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("products")
                .select("*")
                .eq("is_active", true)
                .order("name");
            if (error) throw error;
            return data as Product[];
        }
    });

    const { data: trip } = useQuery({
        queryKey: ["current_trip", user?.id],
        queryFn: async () => {
            if (!user?.id) return null;
            const { data } = await supabase
                .from("trips")
                .select("id")
                .eq("salesman_id", user.id)
                .eq("trip_date", new Date().toISOString().split("T")[0])
                .eq("status", "active")
                .maybeSingle();
            return data;
        },
        enabled: !!user?.id
    });

    const saleMutation = useMutation({
        mutationFn: async () => {
            if (!selectedShop || !activeStorehouse || cart.length === 0) {
                throw new Error("Missing required data");
            }

            const items = cart.map(item => ({
                product_id: item.product_id,
                qty: item.qty,
                custom_price: item.custom_price
            }));

            const { data, error } = await supabase.rpc("process_sale_transaction", {
                p_shop_id: selectedShop,
                p_storehouse_id: activeStorehouse,
                p_cash_collected: cashCollected,
                p_trip_id: trip?.id || null,
                p_items: items
            });

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            toast("Sale completed successfully!");
            setCart([]);
            setCashCollected(0);
            setSelectedShop(null);
            queryClient.invalidateQueries({ queryKey: ["inventory"] });
            queryClient.invalidateQueries({ queryKey: ["salesman_stocks"] });
            router.push("/salesman/dashboard");
        },
        onError: (error: any) => {
            toast(error.message || "Failed to process sale");
        }
    });

    const addToCart = (product: Product) => {
        const existing = cart.find(item => item.product_id === product.id);
        if (existing) {
            setCart(cart.map(item =>
                item.product_id === product.id
                    ? { ...item, qty: item.qty + 1 }
                    : item
            ));
        } else {
            setCart([...cart, {
                product_id: product.id,
                product_name: product.name,
                qty: 1,
                custom_price: null,
                default_price: product.default_selling_price
            }]);
        }
        setShowProductModal(false);
    };

    const updateQty = (product_id: number, delta: number) => {
        setCart(cart.map(item =>
            item.product_id === product_id
                ? { ...item, qty: Math.max(0, item.qty + delta) }
                : item
        ).filter(item => item.qty > 0));
    };

    const updatePrice = (product_id: number, price: number | null) => {
        setCart(cart.map(item =>
            item.product_id === product_id
                ? { ...item, custom_price: price }
                : item
        ));
    };

    const removeItem = (product_id: number) => {
        setCart(cart.filter(item => item.product_id !== product_id));
    };

    const totalRevenue = cart.reduce((sum, item) => {
        const price = item.custom_price !== null ? item.custom_price : item.default_price;
        return sum + (price * item.qty);
    }, 0);

    const outstandingAmount = totalRevenue - cashCollected;

    return (
        <div className="space-y-4 pb-24">
            <div>
                <h1 className="text-xl font-bold" style={{ color: "#3E2758" }}>Point of Sale</h1>
                <p className="text-sm text-zinc-500">Create a new sale</p>
            </div>

            {/* Shop Selection */}
            <div className="bg-white rounded-xl border border-zinc-200 p-4">
                <label className="block text-sm font-medium mb-2" style={{ color: "#3E2758" }}>
                    Select Shop
                </label>
                <select
                    value={selectedShop || ""}
                    onChange={(e) => setSelectedShop(e.target.value ? Number(e.target.value) : null)}
                    className="w-full border border-zinc-300 rounded-lg px-3 py-2 outline-none focus:border-violet-500"
                >
                    <option value="">Choose a shop...</option>
                    {shops?.map(shop => (
                        <option key={shop.id} value={shop.id}>{shop.name}</option>
                    ))}
                </select>
            </div>

            {/* Cart */}
            <div className="bg-white rounded-xl border border-zinc-200 p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold" style={{ color: "#3E2758" }}>Cart Items</h3>
                    <button
                        onClick={() => setShowProductModal(true)}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg text-white text-sm"
                        style={{ backgroundColor: "#3E2758" }}
                    >
                        <Plus size={16} />
                        Add Product
                    </button>
                </div>

                {cart.length > 0 ? (
                    <div className="space-y-2">
                        {cart.map((item) => (
                            <div key={item.product_id} className="border border-zinc-200 rounded-lg p-3">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <p className="font-medium text-sm" style={{ color: "#3E2758" }}>
                                            {item.product_name}
                                        </p>
                                        <p className="text-xs text-zinc-500">Default: ₹{item.default_price}</p>
                                    </div>
                                    <button
                                        onClick={() => removeItem(item.product_id)}
                                        className="p-1 hover:bg-red-50 rounded"
                                    >
                                        <Trash2 size={16} className="text-red-600" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-2 bg-zinc-100 rounded-lg p-1">
                                        <button
                                            onClick={() => updateQty(item.product_id, -1)}
                                            className="p-1 hover:bg-white rounded"
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span className="w-8 text-center font-medium">{item.qty}</span>
                                        <button
                                            onClick={() => updateQty(item.product_id, 1)}
                                            className="p-1 hover:bg-white rounded"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>

                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="Custom price"
                                        value={item.custom_price || ""}
                                        onChange={(e) => updatePrice(item.product_id, e.target.value ? parseFloat(e.target.value) : null)}
                                        className="flex-1 border border-zinc-300 rounded-lg px-2 py-1 text-sm outline-none"
                                    />

                                    <span className="font-bold text-sm" style={{ color: "#3E2758" }}>
                                        ₹{((item.custom_price !== null ? item.custom_price : item.default_price) * item.qty).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <ShoppingCart className="mx-auto mb-2 text-zinc-300" size={40} />
                        <p className="text-zinc-500 text-sm">Cart is empty</p>
                    </div>
                )}
            </div>

            {/* Summary */}
            {cart.length > 0 && (
                <div className="bg-white rounded-xl border border-zinc-200 p-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-zinc-600">Total Revenue</span>
                        <span className="text-xl font-bold" style={{ color: "#3E2758" }}>
                            ₹{totalRevenue.toFixed(2)}
                        </span>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "#3E2758" }}>
                            Cash Collected
                        </label>
                        <div className="flex items-center gap-2">
                            <DollarSign className="text-green-600" size={20} />
                            <input
                                type="number"
                                step="0.01"
                                value={cashCollected}
                                onChange={(e) => setCashCollected(parseFloat(e.target.value) || 0)}
                                className="flex-1 border border-zinc-300 rounded-lg px-3 py-2 outline-none focus:border-violet-500"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-zinc-200">
                        <span className="text-zinc-600">Outstanding</span>
                        <span className={`text-lg font-bold ${outstandingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            ₹{Math.abs(outstandingAmount).toFixed(2)}
                        </span>
                    </div>

                    <button
                        onClick={() => saleMutation.mutate()}
                        disabled={!selectedShop || cart.length === 0 || saleMutation.isPending}
                        className="w-full py-3 rounded-lg text-white font-bold disabled:opacity-50"
                        style={{ backgroundColor: "#3E2758" }}
                    >
                        {saleMutation.isPending ? "Processing..." : "Complete Sale"}
                    </button>
                </div>
            )}

            {/* Product Modal */}
            {showProductModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold" style={{ color: "#3E2758" }}>Select Product</h3>
                            <button onClick={() => setShowProductModal(false)} className="p-2 hover:bg-zinc-100 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-2">
                            {products?.map(product => (
                                <button
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    className="w-full text-left p-3 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
                                >
                                    <p className="font-medium" style={{ color: "#3E2758" }}>{product.name}</p>
                                    <p className="text-sm text-zinc-500">₹{product.default_selling_price}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
