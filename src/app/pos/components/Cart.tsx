"use client";

import React, { useState } from "react";
import { Minus, Plus, Trash2, ShoppingCart, ChevronUp, ChevronDown } from "lucide-react";

type CartItem = {
  product: {
    id: number;
    name: string;
    default_selling_price: number;
  };
  qty: number;
};

type Props = {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  onCheckout: () => void;
};

export default function CartView({ cart, setCart, onCheckout }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  function inc(i: number) {
    const newCart = [...cart];
    newCart[i].qty += 1;
    setCart(newCart);
  }

  function dec(i: number) {
    const newCart = [...cart];
    newCart[i].qty = Math.max(1, newCart[i].qty - 1);
    setCart(newCart);
  }

  function remove(i: number) {
    const newCart = [...cart];
    newCart.splice(i, 1);
    setCart(newCart);
  }

  const total = cart.reduce(
    (sum, item) => sum + item.product.default_selling_price * item.qty,
    0
  );

  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  if (cart.length === 0) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Cart Panel */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-30 transition-transform duration-300 ease-in-out ${isOpen ? "translate-y-0" : "translate-y-[calc(100%-80px)]"
          }`}
        style={{ maxHeight: '85vh' }}
      >
        {/* Handle / Summary Bar */}
        <div
          className="p-4 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-4" />

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-violet-600 text-white h-10 w-10 rounded-full flex items-center justify-center font-bold">
                {itemCount}
              </div>
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Total</p>
                <p className="text-xl font-bold text-zinc-900 dark:text-white">₹{total.toFixed(2)}</p>
              </div>
            </div>

            <button
              className={`p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            >
              <ChevronUp />
            </button>
          </div>
        </div>

        {/* Scrollable Items */}
        <div className="overflow-y-auto p-4 space-y-4" style={{ maxHeight: 'calc(85vh - 160px)' }}>
          {cart.map((c, i) => (
            <div key={c.product.id} className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl">
              <div className="flex-1">
                <p className="font-medium text-zinc-900 dark:text-white line-clamp-1">{c.product.name}</p>
                <p className="text-sm text-zinc-500">₹{c.product.default_selling_price}</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => { e.stopPropagation(); dec(i); }}
                  className="w-8 h-8 flex items-center justify-center bg-white dark:bg-zinc-700 rounded-full shadow-sm border border-zinc-200 dark:border-zinc-600"
                >
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center font-medium">{c.qty}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); inc(i); }}
                  className="w-8 h-8 flex items-center justify-center bg-white dark:bg-zinc-700 rounded-full shadow-sm border border-zinc-200 dark:border-zinc-600"
                >
                  <Plus size={14} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); remove(i); }}
                  className="ml-2 text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Checkout Button */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={(e) => { e.stopPropagation(); onCheckout(); }}
            className="w-full py-4 bg-violet-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-violet-200 dark:shadow-none active:scale-[0.98] transition-transform"
          >
            Checkout (₹{total.toFixed(2)})
          </button>
        </div>
      </div>
    </>
  );
}
