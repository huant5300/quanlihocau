import { BaseService } from "./base-service";

export class PaymentService extends BaseService {
  async processPayment(paymentData: { session_id: string; amount: number; method: string }) {
    try {
      const { data, error } = await this.supabase
        .from("payments")
        .insert(paymentData)
        .select()
        .single();

      if (error) throw error;

      const { error: updateError } = await this.supabase
        .from("sessions")
        .update({ status: "COMPLETED" })
        .eq("id", paymentData.session_id);

      if (updateError) throw updateError;

      return data;
    } catch (error) {
      this.handleError(error, "Xử lý thanh toán");
    }
  }
}

export const paymentService = new PaymentService();
