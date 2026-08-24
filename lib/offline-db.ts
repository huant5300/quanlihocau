import Dexie, { type Table } from 'dexie';
import { FishingPackage, Product, FishingArea } from '@prisma/client';

export interface OfflineSession {
  id: string;
  lakeId: string;
  areaId: string;
  customerId?: string;
  customerName?: string;
  phone?: string;
  startTime: string;
  endTime?: string;
  packageId?: string;
  prepaidAmount: number;
  products: any[];
  status: 'PENDING_SYNC' | 'SYNCED' | 'FAILED';
  createdAt: string;
}

export class FishingLakeDB extends Dexie {
  packages!: Table<FishingPackage, string>;
  products!: Table<Product, string>;
  areas!: Table<FishingArea, string>;
  pendingSessions!: Table<OfflineSession, string>;

  constructor() {
    super('FishingLakeDB');
    
    // Define tables and indexes
    this.version(1).stores({
      packages: 'id, lakeId',
      products: 'id, lakeId, categoryId',
      areas: 'id, lakeId, status',
      pendingSessions: 'id, lakeId, status'
    });
  }
}

export const db = new FishingLakeDB();

// Helper to sync master data to indexedDB for offline use
export const syncMasterDataToOffline = async (
  packages: FishingPackage[], 
  products: Product[], 
  areas: FishingArea[]
) => {
  try {
    await db.transaction('rw', db.packages, db.products, db.areas, async () => {
      await db.packages.clear();
      await db.products.clear();
      await db.areas.clear();

      if (packages.length) await db.packages.bulkAdd(packages);
      if (products.length) await db.products.bulkAdd(products);
      if (areas.length) await db.areas.bulkAdd(areas);
    });
    console.log('Master data synced to Dexie for offline use');
  } catch (error) {
    console.error('Failed to sync master data to offline DB:', error);
  }
};
