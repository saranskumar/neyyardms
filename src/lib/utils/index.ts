// Central barrel for shared utilities used as `@/lib/utils`

// Simple currency formatter for INR
export function money(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

// Very lightweight toast helper.
// For now this uses console + window.alert as a fallback.
// You can later plug this into a proper ToastContext.
export function toast(message: string) {
  if (typeof window !== "undefined") {
    // Replace with your custom UI toast if available
    // e.g., enqueueSnackbar(message) or a context-based toast
    // For now, avoid blocking alerts in most flows – but keep as fallback.
    console.log("[toast]", message);
  } else {
    console.log("[toast-ssr]", message);
  }
}

// Network status helper
export function isOnline(): boolean {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
}

// Generic RPC result type used across admin/pos flows
export type RpcResult<T> =
  | { success: true; data: T }
  | { success: false; message: string };

// Helper to normalize Supabase RPC responses into RpcResult<T>
export function handleRpcResult<T>(
  error: { message?: string } | null,
  data: T | null
): RpcResult<T> {
  if (error || !data) {
    return {
      success: false,
      message: error?.message || "Operation failed",
    };
  }
  return {
    success: true,
    data,
  };
}
