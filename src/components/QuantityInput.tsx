"use client";

import { Minus, Plus } from "lucide-react";

interface QuantityInputProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    className?: string;
}

export default function QuantityInput({
    value,
    onChange,
    min = 0,
    max = 9999,
    step = 1,
    disabled = false,
    className = ""
}: QuantityInputProps) {
    const handleIncrement = () => {
        const newValue = value + step;
        if (newValue <= max) {
            onChange(newValue);
        }
    };

    const handleDecrement = () => {
        const newValue = value - step;
        if (newValue >= min) {
            onChange(newValue);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseFloat(e.target.value) || 0;
        if (newValue >= min && newValue <= max) {
            onChange(newValue);
        }
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <button
                type="button"
                onClick={handleDecrement}
                disabled={disabled || value <= min}
                className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg border-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                    borderColor: disabled || value <= min ? "#d4d4d8" : "#3E2758",
                    backgroundColor: disabled || value <= min ? "#fafafa" : "white"
                }}
            >
                <Minus size={16} style={{ color: disabled || value <= min ? "#a1a1aa" : "#3E2758" }} />
            </button>

            <input
                type="number"
                value={value}
                onChange={handleInputChange}
                disabled={disabled}
                min={min}
                max={max}
                step={step}
                className="w-16 sm:w-20 text-center border-2 rounded-lg px-2 py-1.5 sm:py-2 text-sm sm:text-base font-bold outline-none focus:border-violet-500 disabled:opacity-50 disabled:bg-zinc-50"
                style={{ borderColor: "#d4d4d8", color: "#3E2758" }}
            />

            <button
                type="button"
                onClick={handleIncrement}
                disabled={disabled || value >= max}
                className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                    backgroundColor: disabled || value >= max ? "#fafafa" : "#3E2758",
                    borderColor: disabled || value >= max ? "#d4d4d8" : "#3E2758",
                    borderWidth: "2px"
                }}
            >
                <Plus size={16} style={{ color: disabled || value >= max ? "#a1a1aa" : "white" }} />
            </button>
        </div>
    );
}
