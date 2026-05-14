import { NextRequest, NextResponse } from "next/server";
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
    
    const lakeId = await getActiveLakeId();
    
    // We might want to pass 'search' to Repository, but for now getAll handles lakeId
    const products = await ProductRepository.getAll(lakeId);
    
    // Simple filter if search is provided
    let filteredProducts = products;
    if (search) {
      filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    return NextResponse.json(filteredProducts);
  } catch (error: any) {
    console.error("API Products GET Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const lakeId = await getActiveLakeId();

    // Basic validation
    if (!body.name || !body.categoryId || !body.price) {
      return NextResponse.json({ 
        success: false, 
        message: "Thiếu thông tin sản phẩm (tên, danh mục, giá)" 
      }, { status: 400 });
    }

    const product = await ProductRepository.create({
      name: body.name,
      categoryId: body.categoryId,
      price: body.price,
      stock: body.stock || 0,
      lakeId: lakeId,
      isActive: true,
    });

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("API Products POST Error:", error);
    
    // Better error message for Prisma/Database errors
    let errorMessage = "Không thể thêm sản phẩm";
    if (error.code === 'P2002') {
      errorMessage = "Sản phẩm đã tồn tại (trùng mã hoặc tên)";
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json({ 
      success: false, 
      message: errorMessage 
    }, { status: 500 });
  }
}
