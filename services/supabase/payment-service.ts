import { BaseService } from "./base-service";

export class PaymentService extends BaseService {
  async processPayment(paymentData: any) {
    try {
      const { data, error } = await this.supabase
        .from("payments")
        .insert(paymentData)
        .select()
        .single();

      if (error) throw error;
      
      // Update session status to COMPLETED
      await this.supabase
        .from("sessions")
        .update({ status: "COMPLETED" })
        .eq("id", paymentData.session_id);

      return data;
    } catch (error) {
      this.handleError(error, "Xử lý thanh toán");
    }
  }
}

export const paymentService = new PaymentService();
