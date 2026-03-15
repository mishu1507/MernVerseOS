// ========================================
// Mongo Engine - MongoDB behavior simulator
// ========================================

export interface MongoDocument {
    _id: string;
    [key: string]: unknown;
}

export interface MongoCollection {
    name: string;
    documents: MongoDocument[];
    indexes: string[];
}

export interface QueryResult {
    documents: MongoDocument[];
    scanType: "index" | "full-scan";
    docsScanned: number;
    time: number; // simulated ms
}

export class MongoEngine {
    private collections: Map<string, MongoCollection> = new Map();

    createCollection(name: string): void {
        this.collections.set(name, {
            name,
            documents: [],
            indexes: ["_id"], // _id is always indexed
        });
    }

    getCollection(name: string): MongoCollection | undefined {
        return this.collections.get(name);
    }

    getAllCollections(): MongoCollection[] {
        return Array.from(this.collections.values());
    }

    insert(collectionName: string, doc: MongoDocument): boolean {
        const collection = this.collections.get(collectionName);
        if (!collection) return false;
        collection.documents.push(doc);
        return true;
    }

    find(collectionName: string, queryKey: string, value: unknown): QueryResult {
        const collection = this.collections.get(collectionName);
        if (!collection) {
            return { documents: [], scanType: "full-scan", docsScanned: 0, time: 0 };
        }

        const hasIndex = collection.indexes.includes(queryKey);
        const results = collection.documents.filter(doc => doc[queryKey] === value);

        if (hasIndex) {
            return {
                documents: results,
                scanType: "index",
                docsScanned: results.length,
                time: results.length * 1, // ~1ms per indexed doc
            };
        }

        // Full collection scan
        return {
            documents: results,
            scanType: "full-scan",
            docsScanned: collection.documents.length,
            time: collection.documents.length * 5, // ~5ms per scanned doc
        };
    }

    addIndex(collectionName: string, field: string): boolean {
        const collection = this.collections.get(collectionName);
        if (!collection) return false;
        if (!collection.indexes.includes(field)) {
            collection.indexes.push(field);
        }
        return true;
    }

    removeIndex(collectionName: string, field: string): void {
        const collection = this.collections.get(collectionName);
        if (!collection) return;
        collection.indexes = collection.indexes.filter(i => i !== field);
    }

    clear(): void {
        this.collections.clear();
    }
}
