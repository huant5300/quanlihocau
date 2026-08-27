import Dexie, { Table } from 'dexie';

export interface OfflineSession {
  id: string; // UUID sinh từ client
  lakeId: string;
  areaId: string;
  customerName?: string;
  customerId?: string;
  customerPhone?: string;
  packageId?: string;
  startTime: string;
  hourlyRate: number;
  prepaidAmount?: number;
  syncStatus: 'PENDING' | 'SYNCED' | 'ERROR';
  updatedAt: string;
}

export interface OfflineInvoiceItem {
  id: string;
  sessionId: string;
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  syncStatus: 'PENDING' | 'SYNCED';
  updatedAt: string;
}

export interface MasterPackage { id: string; name: string; price: number; durationHours: number; }
export interface MasterProduct { id: string; name: string; price: number; }
export interface MasterArea { id: string; name: string; status: string; }

export class FishingLakeOfflineDB extends Dexie {
  sessions!: Table<OfflineSession, string>;
  invoiceItems!: Table<OfflineInvoiceItem, string>;
  packages!: Table<MasterPackage, string>;
  products!: Table<MasterProduct, string>;
  areas!: Table<MasterArea, string>;

  constructor() {
    super('FishingLakeOfflineDB');
    this.version(3).stores({
      sessions: 'id, lakeId, syncStatus, updatedAt',
      invoiceItems: 'id, sessionId, syncStatus, updatedAt',
      packages: 'id',
      products: 'id',
      areas: 'id'
    });
  }
}

export const offlineDB = new FishingLakeOfflineDB();

export async function syncMasterDataToOffline(packages: any[], products: any[], areas: any[]) {
  try {
    await offlineDB.transaction('rw', offlineDB.packages, offlineDB.products, offlineDB.areas, async () => {
      await offlineDB.packages.clear();
      await offlineDB.packages.bulkAdd(packages.map(p => ({
        id: p.id, name: p.name, price: Number(p.price), durationHours: Number(p.durationHours)
      })));

      await offlineDB.products.clear();
      await offlineDB.products.bulkAdd(products.map(p => ({
        id: p.id, name: p.name, price: Number(p.price)
      })));

      await offlineDB.areas.clear();
      await offlineDB.areas.bulkAdd(areas.map(a => ({
        id: a.id, name: a.name, status: a.status
      })));
    });
    console.log("Master data synced to offline DB");
  } catch (err) {
    console.error("Failed to sync master data to Dexie:", err);
  }
}
