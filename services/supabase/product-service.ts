import { BaseService } from "./base-service";

export class ProductService extends BaseService {
  async getProducts() {
    try {
      const { data, error } = await this.supabase
        .from("products")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;
      return data;
    } catch (error) {
      this.handleError(error, "Lấy danh sách sản phẩm");
    }
  }

  async updateStock(id: string, newStock: number) {
    try {
      const { data, error } = await this.supabase
        .from("products")
        .update({ stock: newStock })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      this.handleError(error, "Cập nhật tồn kho");
    }
  }
}

export const productService = new ProductService();
