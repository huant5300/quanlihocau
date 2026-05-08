import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export class BaseService {
  protected supabase = createClient();

  protected handleError(error: any, context: string) {
    console.error(`Error in ${context}:`, error);
    toast.error(`Lỗi hệ thống: ${context}`, {
      description: error.message || "Đã có lỗi xảy ra, vui lòng thử lại."
    });
    throw error;
  }
}
