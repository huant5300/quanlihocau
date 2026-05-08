import { BaseService } from "./base-service";
import { FishingSession } from "@/modules/sessions/types/session.types";

export class SessionService extends BaseService {
  async getActiveSessions() {
    try {
      const { data, error } = await this.supabase
        .from("sessions")
        .select(`
          *,
          customers (
            full_name,
            phone
          )
        `)
        .neq("status", "COMPLETED")
        .order("start_time", { ascending: false });

      if (error) throw error;
      
      return (data || []).map(row => ({
        id: row.id,
        hut_number: row.hut_number,
        customer_id: row.customer_id,
        customer_name: row.customers?.full_name || "Khách lẻ",
        phone: row.customers?.phone || "",
        start_time: row.start_time,
        end_time: row.end_time,
        total_amount: row.total_amount || 0,
        product_count: 0, // Simplified for now
        products: [], // Simplified for now
        status: row.status as FishingSession["status"] || "ACTIVE",
        created_at: row.created_at,
        updated_at: row.updated_at,
      })) as FishingSession[];
    } catch (error) {
      this.handleError(error, "Lấy danh sách lượt câu");
      return [];
    }
  }

  async createSession(sessionData: Partial<FishingSession>) {
    try {
      const { data, error } = await this.supabase
        .from("sessions")
        .insert({
          hut_number: sessionData.hut_number,
          customer_id: sessionData.customer_id,
          start_time: new Date().toISOString(),
          status: "ACTIVE",
          end_time: sessionData.end_time || new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
          total_amount: sessionData.total_amount || 0
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      this.handleError(error, "Mở lượt câu mới");
    }
  }

  async updateStatus(id: string, status: FishingSession["status"]) {
    try {
      const { data, error } = await this.supabase
        .from("sessions")
        .update({ status } as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      this.handleError(error, "Cập nhật trạng thái lượt câu");
    }
  }
}

export const sessionService = new SessionService();
