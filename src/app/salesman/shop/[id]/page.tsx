"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Store, TrendingUp, Calendar, ArrowLeft, ShoppingCart, DollarSign } from "lucide-react"; // Added DollarSign icon
import { useState } from "react"; // Added useState hook

// Assuming a PaymentModal component exists and is imported
// For this example, we'll define a placeholder for it.
// In a real application, this would be a separate component file.
interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    shopId: number;
    shopName: string;
    onPaymentSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, shopId, shopName, onPaymentSuccess }) => {
    const [amount, setAmount] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handlePaymentSubmit = async () => {
        const paymentAmount = parseFloat(amount);
        if (isNaN(paymentAmount) || paymentAmount <= 0) {
            setError("Please enter a valid amount.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Simulate API call to record payment
            // In a real app, this would interact with your backend/Supabase
            const { data, error: supabaseError } = await supabase
                .from("payments") // Assuming a 'payments' table
                .insert([
                    { shop_id: shopId, amount: paymentAmount, type: "collection" } // Example payment type
                ]);

            if (supabaseError) throw supabaseError;

            // Simulate updating shop balance (this would ideally be a database trigger or a separate function)
            // For now, we'll just call onPaymentSuccess to trigger a refetch
            console.log(`Collected ₹${paymentAmount} from ${shopName} (Shop ID: ${shopId})`);
            onPaymentSuccess();
            onClose();
            setAmount(""); // Clear amount after successful payment
        } catch (err: any) {
            setError(err.message || "Failed to record payment.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 border border-zinc-200">
                <h2 className="text-xl font-bold mb-4" style={{ color: "#3E2758" }}>Collect Payment from {shopName}</h2>
                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
                <div className="mb-4">
                    <label htmlFor="amount" className="block text-sm font-medium text-zinc-700 mb-1">Amount</label>
                    <input
                        type="number"
                        id="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full p-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter amount to collect"
                        min="0.01"
                        step="0.01"
                        disabled={loading}
                    />
                </div>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-md border border-zinc-300 text-zinc-700 hover:bg-zinc-50 transition-colors"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handlePaymentSubmit}
                        className="px-4 py-2 rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: "#3E2758" }}
                        disabled={loading}
                    >
                        {loading ? "Collecting..." : "Collect Payment"}
                    </button>
                </div>
            </div>
        </div>
    );
};


interface Shop {
    id: number;
    name: string;
    current_balance: number;
}

export default function ShopDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const shopId = Number(params.id);

    const [showPaymentModal, setShowPaymentModal] = useState(false); // State for modal visibility

    const { data: shop, isLoading, refetch: refetchShop } = useQuery({ // Added refetch for shop data
        queryKey: ["shop", shopId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("shops")
                .select("*")
                .eq("id", shopId)
                .single();
            if (error) throw error;
            return data as Shop;
        }
    });

    const { data: recentSales, refetch: refetchSales } = useQuery({ // Added refetch for sales data
        queryKey: ["shop_sales", shopId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("sales")
                .select("*")
                .eq("shop_id", shopId)
                .order("created_at", { ascending: false })
                .limit(5);
            if (error) throw error;
            return data;
        }
    });

    const handlePaymentSuccess = () => {
        refetchShop(); // Refetch shop data to update balance
        refetchSales(); // Refetch sales/payments if they are related or to show new payment as an activity
        // Optionally, show a toast notification
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: "#3E2758" }}></div>
            </div>
        );
    }

    if (!shop) {
        return (
            <div className="p-4">
                <p className="text-zinc-500">Shop not found</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900"
            >
                <ArrowLeft size={20} />
                <span>Back</span>
            </button>

            <div className="bg-white rounded-xl border border-zinc-200 p-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl" style={{ backgroundColor: "#3E2758" + "20" }}>
                        <Store size={32} style={{ color: "#3E2758" }} />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold" style={{ color: "#3E2758" }}>{shop.name}</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <TrendingUp size={16} className={shop.current_balance > 0 ? "text-red-600" : "text-green-600"} />
                            <span className={`font-medium ${shop.current_balance > 0 ? "text-red-600" : "text-green-600"}`}>
                                Balance: ₹{Math.abs(shop.current_balance).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => router.push(`/salesman/pos?shop=${shopId}`)}
                    className="bg-white rounded-xl border border-zinc-200 p-4 hover:shadow-md transition-shadow"
                >
                    <ShoppingCart className="mx-auto mb-2" style={{ color: "#3E2758" }} size={32} />
                    <p className="font-medium text-sm" style={{ color: "#3E2758" }}>New Sale</p>
                </button>
                <button
                    onClick={() => setShowPaymentModal(true)} // Open payment modal
                    className="bg-white rounded-xl border border-zinc-200 p-4 hover:shadow-md transition-shadow"
                >
                    <DollarSign className="mx-auto mb-2 text-green-600" size={32} /> {/* Changed icon to DollarSign */}
                    <p className="font-medium text-sm" style={{ color: "#3E2758" }}>Collect Payment</p>
                </button>
            </div>

            <div className="bg-white rounded-xl border border-zinc-200 p-4">
                <h3 className="font-bold mb-3" style={{ color: "#3E2758" }}>Recent Sales</h3>
                {recentSales && recentSales.length > 0 ? (
                    <div className="space-y-2">
                        {recentSales.map((sale: any) => (
                            <div key={sale.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-zinc-400" />
                                    <span className="text-sm text-zinc-600">
                                        {new Date(sale.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <span className="font-bold text-sm" style={{ color: "#3E2758" }}>
                                    ₹{sale.total_revenue.toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-zinc-500 text-sm text-center py-4">No recent sales</p>
                )}
            </div>

            {/* Payment Modal Integration */}
            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                shopId={shopId}
                shopName={shop.name}
                onPaymentSuccess={handlePaymentSuccess}
            />
        </div>
    );
}
