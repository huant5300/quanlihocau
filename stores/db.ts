import Dexie, { Table } from "dexie";

export interface OfflineTicket {
  id: string;
  lakeId: string;
  areaId: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  packageId?: string;
  hourlyRate: number;
  startTime: string;
  prepaidAmount: number;
  syncStatus: "PENDING" | "SYNCED" | "FAILED";
  createdAt: string;
  updatedAt: string;
}

export interface OfflineProduct {
  id: string;
  lakeId: string;
  name: string;
  price: number;
  costPrice?: number;
  stock: number;
  unit: string;
  categoryId?: string;
  syncStatus: "PENDING" | "SYNCED" | "FAILED";
  updatedAt: string;
}

export class OfflineDatabase extends Dexie {
  offlineTickets!: Table<OfflineTicket, string>;
  offlineProducts!: Table<OfflineProduct, string>;

  constructor() {
    super("QuanLiHoCauOfflineDB");
    this.version(1).stores({
      offlineTickets: "id, lakeId, areaId, customerId, syncStatus, createdAt",
      offlineProducts: "id, lakeId, name, categoryId, syncStatus, updatedAt",
    });
  }
}

export const db = new OfflineDatabase();
