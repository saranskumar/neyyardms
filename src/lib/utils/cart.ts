export function addToCart(cart: any[], product: any, qty = 1) {
  const index = cart.findIndex((c) => c.product.id === product.id);

  if (index >= 0) {
    cart[index].qty += qty;
  } else {
    cart.push({ product, qty });
  }

  return [...cart];
}

export function removeFromCart(cart: any[], productId: number) {
  return cart.filter((c) => c.product.id !== productId);
}

export function updateQty(cart: any[], productId: number, qty: number) {
  return cart.map((c) =>
    c.product.id === productId ? { ...c, qty } : c
  );
}

export function cartTotal(cart: any[]) {
  return cart.reduce(
    (sum, c) => sum + c.product.default_selling_price * c.qty,
    0
  );
}
