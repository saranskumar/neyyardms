"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface ExpenseModalProps {
    onClose: () => void;
    onSave: (expense: {
        category: string;
        amount: number;
        notes: string;
    }) => void;
}

const CATEGORIES = [
    { value: "fuel", label: "Fuel", icon: "⛽" },
    { value: "meals", label: "Meals", icon: "🍽️" },
    { value: "vehicle", label: "Vehicle Maintenance", icon: "🔧" },
    { value: "transport", label: "Transport", icon: "🚗" },
    { value: "misc", label: "Miscellaneous", icon: "📦" },
];

export default function ExpenseModal({ onClose, onSave }: ExpenseModalProps) {
    const [formData, setFormData] = useState({
        category: "",
        amount: 0,
        notes: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.category || formData.amount <= 0) {
            return;
        }
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold" style={{ color: "#3E2758" }}>Add Expense</h2>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "#3E2758" }}>
                            Category
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, category: cat.value })}
                                    className={`p-3 rounded-lg border-2 transition-colors text-left ${formData.category === cat.value
                                            ? "border-violet-500 bg-violet-50"
                                            : "border-zinc-200 hover:border-zinc-300"
                                        }`}
                                >
                                    <div className="text-2xl mb-1">{cat.icon}</div>
                                    <div className="text-sm font-medium">{cat.label}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "#3E2758" }}>
                            Amount (₹)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.amount || ""}
                            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                            className="w-full border border-zinc-300 rounded-lg px-3 py-2 outline-none focus:border-violet-500"
                            placeholder="0.00"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "#3E2758" }}>
                            Notes
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full border border-zinc-300 rounded-lg px-3 py-2 outline-none focus:border-violet-500 resize-none"
                            rows={3}
                            placeholder="Add details about this expense"
                        />
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
                            Add Expense
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
