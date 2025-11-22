import { supabase } from "./supabase";
import { v4 as uuid } from "uuid";

export async function makeSale({
  shopId,
  storehouseId,
  tripId,
  items,
  cashCollected,
}) {
  return supabase.rpc("process_sale_transaction", {
    p_shop_id: shopId,
    p_storehouse_id: storehouseId,
    p_cash_collected: cashCollected,
    p_trip_id: tripId,
    p_items: JSON.stringify(items),
    p_client_txn_id: uuid()
  });
}

export async function collectPayment(shopId: number, amount: number) {
  return supabase.rpc("collect_payment", {
    p_shop_id: shopId,
    p_amount: amount,
    p_notes: "Cash"
  });
}

export async function reportDamage({
  storehouseId,
  productId,
  qty,
  reason,
  type
}) {
  return supabase.rpc("report_damage", {
    p_storehouse_id: storehouseId,
    p_product_id: productId,
    p_qty: qty,
    p_reason: reason,
    p_type: type
  });
}
