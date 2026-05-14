"use server";

import { CustomerRepository } from "@/repositories/customer-repository";
import { revalidatePath } from "next/cache";
import { getActiveLakeId } from "@/lib/lake-context";

export async function createCustomerAction(data: { fullName: string; phone: string; address?: string; notes?: string }) {
  try {
    const lakeId = await getActiveLakeId();
    const customer = await CustomerRepository.create({ ...data, lakeId });
    revalidatePath("/dashboard/customers");
    revalidatePath("/dashboard/crm");
    return { success: true, data: customer };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateCustomerAction(id: string, data: any) {
  try {
    const customer = await CustomerRepository.update(id, data);
    revalidatePath("/dashboard/customers");
    revalidatePath("/dashboard/crm");
    return { success: true, data: customer };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCustomerAction(id: string) {
  try {
    await CustomerRepository.delete(id);
    revalidatePath("/dashboard/customers");
    revalidatePath("/dashboard/crm");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getCustomersAction() {
  try {
    const lakeId = await getActiveLakeId();
    const customers = await CustomerRepository.getAll(lakeId);
    return { success: true, data: customers };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
