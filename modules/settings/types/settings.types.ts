export type UserRole = "Admin" | "Manager" | "Staff";

export interface LakeSettings {
  name: string;
  address: string;
  phone: string;
  logoUrl?: string;
  receiptFooter: string;
}

export interface FishingPackage {
  id: string;
  name: string;
  duration: number;
  price: number;
  isActive: boolean;
}

export interface Hut {
  id: string;
  number: string;
  capacity: number;
  status: "Available" | "Maintenance" | "Occupied";
}

export interface Employee {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}
