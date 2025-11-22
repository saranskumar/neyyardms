import { openDB } from "idb";

const DB_NAME = "neyyar-offline";
const STORE = "posQueue";

export async function initDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
      }
    }
  });
}

export async function queueTransaction(txn: any) {
  const db = await initDB();
  await db.add(STORE, { txn, created_at: Date.now() });
}

export async function getQueuedTransactions() {
  const db = await initDB();
  return db.getAll(STORE);
}

export async function clearQueue() {
  const db = await initDB();
  const items = await db.getAllKeys(STORE);
  for (const key of items) await db.delete(STORE, key);
}
