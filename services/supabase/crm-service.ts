import { BaseService } from "./base-service";

export class CRMService extends BaseService {
  async getCustomers() {
    try {
      const { data, error } = await this.supabase
        .from("customers")
        .select("*")
        .order("full_name");

      if (error) throw error;
      return data;
    } catch (error) {
      this.handleError(error, "Lấy danh sách khách hàng");
    }
  }

  async getCustomerDetail(id: string) {
    try {
      const { data, error } = await this.supabase
        .from("customers")
        .select(`
          *,
          sessions (id, start_time, total_amount),
          buybacks (id, fish_type, total_amount)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      this.handleError(error, "Lấy chi tiết khách hàng");
    }
  }
}

export const crmService = new CRMService();
