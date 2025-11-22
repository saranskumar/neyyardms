export function handleRpcResult(res: any) {
  if (res.error) {
    console.error("RPC Error:", res.error);
    return {
      success: false,
      message: res.error.message || "Unexpected RPC error"
    };
  }

  return {
    success: true,
    data: res.data
  };
}
