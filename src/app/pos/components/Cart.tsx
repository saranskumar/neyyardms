"use client";

import React from "react";

export default function CartView({ cart, setCart, onCheckout }) {
  function inc(i) {
    const c = [...cart];
    c[i].qty += 1;
    setCart(c);
  }

  function dec(i) {
    const c = [...cart];
    c[i].qty = Math.max(1, c[i].qty - 1);
    setCart(c);
  }

  function remove(i) {
    const c = [...cart];
    c.splice(i, 1);
    setCart(c);
  }

  const total = cart.reduce(
    (s, c) => s + c.product.default_selling_price * c.qty,
    0
  );

  return (
    <aside className="bg-white p-4 rounded shadow space-y-3">
      <h2 className="font-bold">Cart</h2>

      {cart.length === 0 && <div>No items</div>}

      {cart.map((c, i) => (
        <div key={i} className="flex justify-between items-center">
          <div>
            <div>{c.product.name}</div>
            <div className="text-sm text-gray-600">
              ₹{c.product.default_selling_price} × {c.qty}
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => dec(i)} className="px-2 bg-gray-200 rounded">
              -
            </button>
            <span>{c.qty}</span>
            <button onClick={() => inc(i)} className="px-2 bg-gray-200 rounded">
              +
            </button>
            <button onClick={() => remove(i)} className="text-red-600">
              Remove
            </button>
          </div>
        </div>
      ))}

      <div className="font-semibold">Total: ₹{total}</div>

      <button
        onClick={onCheckout}
        className="w-full mt-3 py-2 bg-green-600 text-white rounded"
      >
        Checkout
      </button>
    </aside>
  );
}
