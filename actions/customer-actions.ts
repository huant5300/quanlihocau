"use server";

import { CustomerRepository } from "@/repositories/customer-repository";
import { revalidatePath } from "next/cache";

export async function createCustomerAction(data: { fullName: string; phone: string; address?: string; notes?: string }) {
  try {
    const customer = await CustomerRepository.create(data);
    revalidatePath("/dashboard/customers");
    return { success: true, data: customer };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateCustomerAction(id: string, data: any) {
  try {
    const customer = await CustomerRepository.update(id, data);
    revalidatePath("/dashboard/customers");
    return { success: true, data: customer };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
