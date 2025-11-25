// Offline Queue Manager using IndexedDB
const DB_NAME = 'NeyyarOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'transactions';

export interface OfflineTransaction {
    id?: number;
    type: 'sale' | 'payment' | 'damage' | 'expense';
    data: any;
    timestamp: number;
    userId: string;
    synced: boolean;
}

class OfflineQueue {
    private db: IDBDatabase | null = null;

    async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                    store.createIndex('synced', 'synced', { unique: false });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    }

    async addTransaction(transaction: Omit<OfflineTransaction, 'id' | 'synced'>): Promise<number> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const tx = this.db!.transaction([STORE_NAME], 'readwrite');
            const store = tx.objectStore(STORE_NAME);

            const data: OfflineTransaction = {
                ...transaction,
                synced: false
            };

            const request = store.add(data);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result as number);
        });
    }

    async getPendingTransactions(): Promise<OfflineTransaction[]> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const tx = this.db!.transaction([STORE_NAME], 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const index = store.index('synced');
            // Use IDBKeyRange to query for synced === false
            const request = index.getAll(IDBKeyRange.only(false));

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result as OfflineTransaction[]);
        });
    }

    async markAsSynced(id: number): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const tx = this.db!.transaction([STORE_NAME], 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const getRequest = store.get(id);

            getRequest.onerror = () => reject(getRequest.error);
            getRequest.onsuccess = () => {
                const data = getRequest.result as OfflineTransaction | undefined;
                if (data) {
                    data.synced = true;
                    const updateRequest = store.put(data);
                    updateRequest.onerror = () => reject(updateRequest.error);
                    updateRequest.onsuccess = () => resolve();
                } else {
                    resolve();
                }
            };
        });
    }

    async deleteTransaction(id: number): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const tx = this.db!.transaction([STORE_NAME], 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const request = store.delete(id);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    async clearSyncedTransactions(): Promise<void> {
        if (!this.db) await this.init();

        const transactions = await this.getPendingTransactions();
        const syncedTransactions = transactions.filter((t: OfflineTransaction) => t.synced);

        for (const transaction of syncedTransactions) {
            if (transaction.id) {
                await this.deleteTransaction(transaction.id);
            }
        }
    }

    async getCount(): Promise<number> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const tx = this.db!.transaction([STORE_NAME], 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const request = store.count();

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }
}

export const offlineQueue = new OfflineQueue();
