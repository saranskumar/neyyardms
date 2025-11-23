export type RpcResult<T> = { success: true; data: T } | { success: false; message: string };

export function isRpcFailure<T>(r: RpcResult<T>): r is { success: false; message: string } {
  return !r.success;
}
