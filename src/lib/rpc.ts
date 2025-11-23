import { supabase } from "./supabase";
import { handleRpcResult } from "@/lib/utils/index";


// Type definitions for sale
export type SaleItemPayload = {
  product_id: number;
  qty: number;
  custom_price: number | null;
};

export type MakeSalePayload = {
  shopId: number;
  storehouseId: number;
  tripId: number | null;
  items: SaleItemPayload[];
  cashCollected: number;
  clientTxnId?: string; // for offline queue
};

// Make sale RPC
export async function makeSale(payload: MakeSalePayload) {
  const {
    shopId,
    storehouseId,
    tripId,
    items,
    cashCollected,
    clientTxnId
  } = payload;

  const { data, error } = await supabase.rpc("process_sale_transaction", {
    p_shop_id: shopId,
    p_storehouse_id: storehouseId,
    p_trip_id: tripId,
    p_items: items,
    p_cash_collected: cashCollected,
    p_client_txn_id: clientTxnId ?? crypto.randomUUID()
  });

  return handleRpcResult({ data, error });
}

// Damage RPC (optional for clarity)
export type DamagePayload = {
  storehouseId: number;
  productId: number;
  qty: number;
  reason: string;
  type: string;
};

export async function reportDamage({
  storehouseId,
  productId,
  qty,
  reason,
  type
}: DamagePayload) {
  const { data, error } = await supabase.rpc("report_damage", {
    p_storehouse_id: storehouseId,
    p_product_id: productId,
    p_qty: qty,
    p_reason: reason,
    p_type: type
  });

  return handleRpcResult({ data, error });
}
