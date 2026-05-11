import { Product as DbProduct, ProductCategory } from "@/types/common";

export type { ProductCategory };

export interface Product extends DbProduct {
  // Add UI specific properties if needed
}

export interface ProductCardProps {
  product: Product;
  onQuickAdd?: (product: Product) => void;
  onEdit?: (product: Product) => void;
}
