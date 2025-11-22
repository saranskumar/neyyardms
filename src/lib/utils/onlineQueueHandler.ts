import { getQueuedTransactions, clearQueue } from "../offlineQueue";

export async function flushOfflineTransactions(callback?: Function) {
  const queue = await getQueuedTransactions();

  for (const entry of queue) {
    try {
      await fetch("/rest/v1/rpc/process_sale_transaction", {
        method: "POST",
        body: JSON.stringify(entry.txn),
        headers: { "Content-Type": "application/json" }
      });

      if (callback) callback(entry.txn);
    } catch (err) {
      console.error("Retry failed for:", entry);
    }
  }

  await clearQueue();
}
