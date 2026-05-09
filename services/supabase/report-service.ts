import { BaseService } from "./base-service";

export class ReportService extends BaseService {
  async getMonthlyRevenue() {
    try {
      const { data, error } = await this.supabase
        .from("monthly_revenue_stats")
        .select("*")
        .order("month", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      this.handleError(error, "Lấy báo cáo doanh thu tháng");
      return [];
    }
  }

  async getRevenueByDateRange(startDate: string, endDate: string) {
    try {
      const { data, error } = await this.supabase
        .from("payments")
        .select("amount, created_at")
        .gte("created_at", startDate)
        .lte("created_at", endDate);

      if (error) throw error;
      return data || [];
    } catch (error) {
      this.handleError(error, "Lấy báo cáo doanh thu theo khoảng thời gian");
      return [];
    }
  }
}

export const reportService = new ReportService();
