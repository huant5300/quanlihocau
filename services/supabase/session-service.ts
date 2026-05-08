import { BaseService } from "./base-service";
import { FishingSession } from "@/modules/sessions/types/session.types";

export class SessionService extends BaseService {
  async getActiveSessions() {
    try {
      const { data, error } = await this.supabase
        .from("sessions")
        .select("*")
        .eq("status", "ACTIVE")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      this.handleError(error, "Lấy danh sách lượt câu");
    }
  }

  async createSession(session: any) {
    try {
      const { data, error } = await this.supabase
        .from("sessions")
        .insert(session)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      this.handleError(error, "Mở lượt câu mới");
    }
  }
}

export const sessionService = new SessionService();
