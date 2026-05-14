"use server";

import prisma from "@/lib/prisma";
import { getActiveLakeId } from "@/lib/lake-context";
import { revalidatePath } from "next/cache";
import { ProductRepository } from "@/repositories/product-repository";

export async function getProductsAction() {
  try {
    const lakeId = await getActiveLakeId();
    const products = await ProductRepository.getAll(lakeId);
    return { success: true, data: products };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createProductAction(data: any) {
  try {
    const lakeId = await getActiveLakeId();
    const product = await ProductRepository.create({
      ...data,
      lakeId
    });
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/inventory");
    return { success: true, data: product };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateProductAction(id: string, data: any) {
  try {
    const product = await ProductRepository.update(id, data);
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/inventory");
    return { success: true, data: product };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteProductAction(id: string) {
  try {
    await ProductRepository.delete(id);
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/inventory");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
