export type ProductCategory = "Drinks" | "Bait" | "Food" | "Equipment";

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  thumbnail?: string;
  isActive: boolean;
}

export interface ProductCardProps {
  product: Product;
  onQuickAdd?: (product: Product) => void;
  onEdit?: (product: Product) => void;
}
