"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

interface DoubleConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    itemName: string;
    confirmText?: string;
}

export default function DoubleConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    itemName,
    confirmText = "DELETE"
}: DoubleConfirmDialogProps) {
    const [step, setStep] = useState(1);
    const [inputValue, setInputValue] = useState("");

    const handleClose = () => {
        setStep(1);
        setInputValue("");
        onClose();
    };

    const handleFirstConfirm = () => {
        setStep(2);
    };

    const handleFinalConfirm = () => {
        if (inputValue === confirmText) {
            onConfirm();
            handleClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertTriangle className="text-red-600" size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-red-600">{title}</h2>
                    </div>
                    <button onClick={handleClose} className="p-2 hover:bg-zinc-100 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                {step === 1 ? (
                    <>
                        <div className="mb-6">
                            <p className="text-zinc-700 mb-2">{message}</p>
                            <div className="bg-zinc-100 rounded-lg p-3 mt-3">
                                <p className="font-bold text-zinc-900">{itemName}</p>
                            </div>
                            <p className="text-sm text-red-600 mt-3 font-medium">
                                ⚠️ This action cannot be undone!
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleClose}
                                className="flex-1 px-4 py-2.5 border border-zinc-300 rounded-lg font-medium hover:bg-zinc-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleFirstConfirm}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                            >
                                Continue
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="mb-6">
                            <p className="text-zinc-700 mb-4">
                                To confirm deletion, please type <span className="font-bold text-red-600">{confirmText}</span> below:
                            </p>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="w-full border-2 border-red-300 rounded-lg px-3 py-2.5 outline-none focus:border-red-500 font-mono"
                                placeholder={confirmText}
                                autoFocus
                            />
                            <p className="text-xs text-zinc-500 mt-2">
                                Type exactly as shown (case sensitive)
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep(1)}
                                className="flex-1 px-4 py-2.5 border border-zinc-300 rounded-lg font-medium hover:bg-zinc-50"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleFinalConfirm}
                                disabled={inputValue !== confirmText}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Delete Permanently
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
