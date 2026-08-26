import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ProductRepository } from "@/repositories/product-repository";
import { getActiveLakeId } from "@/lib/lake-context";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search") || undefined;
    
    let lakeId = (await getActiveLakeId()) || "";
    if (!lakeId) {
      const firstLake = await prisma.fishingLake.findFirst();
      lakeId = firstLake?.id || "";
    }
    
    if (!lakeId) {
      return NextResponse.json([]);
    }
    
    const products = await ProductRepository.getAll(lakeId);
    
    let filteredProducts = products || [];
    if (search) {
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    return NextResponse.json(filteredProducts);
  } catch (error: any) {
    console.error("API Products GET Error:", error);
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    let lakeId = (await getActiveLakeId()) || "";

    if (!lakeId) {
      const firstLake = await prisma.fishingLake.findFirst();
      lakeId = firstLake?.id || "";
    }

    // Basic validation
    const name = (body.name || "").trim();
    const price = Number(body.price || 0);

    if (!name || price <= 0) {
      return NextResponse.json({ 
        success: false, 
        message: "Vui lòng nhập tên sản phẩm và đơn giá hợp lệ (> 0đ)" 
      }, { status: 400 });
    }

    let categoryId = body.categoryId;

    // Handle category
    const isValidId = categoryId && categoryId !== "cmp5ikhn00000w9ts0i0n76fh" && !["Mồi câu", "Đồ uống", "Đồ ăn", "Dụng cụ", "Khác", ""].includes(categoryId);
    
    if (isValidId) {
      const catExists = await prisma.productCategory.findUnique({ where: { id: categoryId } }).catch(() => null);
      if (!catExists) categoryId = null;
    } else {
      categoryId = null;
    }

    if (!categoryId) {
      // Find or create default category
      const catName = typeof body.categoryId === "string" && body.categoryId.length > 0 && body.categoryId.length < 30 ? body.categoryId : "Khác";
      let defaultCat = await prisma.productCategory.findFirst({
        where: { name: catName }
      }).catch(() => null);

      if (!defaultCat) {
        defaultCat = await prisma.productCategory.create({ data: { name: catName } });
      }
      categoryId = defaultCat.id;
    }

    const product = await ProductRepository.create({
      name: name,
      categoryId: categoryId,
      price: price,
      stock: Number(body.stock || 100),
      lakeId: lakeId,
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      ...product
    });
  } catch (error: any) {
    console.error("API Products POST Error:", error);
    
    let errorMessage = "Không thể thêm sản phẩm";
    if (error.code === 'P2002') {
      errorMessage = "Sản phẩm với tên này đã tồn tại trong hồ câu";
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json({ 
      success: false, 
      message: errorMessage 
    }, { status: 500 });
  }
}
