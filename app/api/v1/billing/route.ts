import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthLakeContext } from "@/lib/auth-guard";
import { UserRole } from "@prisma/client";

// Gói dịch vụ chuẩn SaaS
export const SAAS_PLANS = {
  TRIAL: {
    id: "TRIAL",
    name: "Gói Dùng Thử",
    price: 0,
    durationDays: 7,
    features: [
      "Trải nghiệm đầy đủ tính năng 7 ngày",
      "Quản lý 1 hồ câu",
      "Tối đa 2 nhân viên",
      "Hỗ trợ kỹ thuật 24/7"
    ],
  },
  SILVER: {
    id: "SILVER",
    name: "Gói Bạc",
    price: 99000,
    durationDays: 30,
    maxLakes: 1,
    maxStaff: 5,
    features: [
      "Full toàn bộ tính năng quản lý",
      "Quản lý tối đa: 1 hồ câu",
      "Tối đa: 5 nhân viên / thu ngân",
      "Tạo vé câu & đếm ngược realtime",
      "In bill nhiệt Bluetooth / Web",
      "Báo cáo doanh thu & xuất file",
      "Hỗ trợ kỹ thuật 24/7"
    ],
  },
  GOLD: {
    id: "GOLD",
    name: "Gói Vàng (Hot)",
    price: 199000,
    durationDays: 30,
    maxLakes: 5,
    maxStaff: 20,
    features: [
      "Full toàn bộ tính năng cao cấp",
      "Quản lý chuỗi tối đa: 5 hồ câu",
      "Tối đa: 20 nhân viên / thu ngân",
      "Không giới hạn ca câu & khách hàng",
      "Quản lý kho hàng, nhập xuất, tồn kho",
      "Báo cáo chuyên sâu & phân tích tăng trưởng",
      "Ưu tiên hỗ trợ riêng & backup dữ liệu"
    ],
  },
};

// Thông tin tài khoản nhận tiền SaaS của bạn
const PAYMENT_INFO = {
  bankId: process.env.SAAS_BANK_ID || "BIDV",
  bankBin: "970418",
  bankName: "BIDV (Đầu tư & Phát triển VN)",
  accountNo: process.env.SAAS_ACCOUNT_NO || "8876045411",
  accountName: process.env.SAAS_ACCOUNT_NAME || "TRAN ANH HUAN",
};

export async function GET(req: NextRequest) {
  try {
    const authResult = await getAuthLakeContext();
    if (!authResult.success) return authResult.response;
    const { lakeId, role } = authResult.context;

    if (!lakeId && role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json({ error: "Không tìm thấy hồ" }, { status: 404 });
    }

    const lake = await prisma.fishingLake.findUnique({
      where: { id: lakeId },
      select: {
        id: true,
        name: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        subscriptionExpiresAt: true,
        createdAt: true,
      },
    });

    if (!lake) {
      return NextResponse.json({ error: "Hồ không tồn tại" }, { status: 404 });
    }

    // Tính số ngày còn lại
    let daysRemaining = 0;
    let isExpired = false;
    if (lake.subscriptionExpiresAt) {
      const now = new Date();
      const diffTime = new Date(lake.subscriptionExpiresAt).getTime() - now.getTime();
      daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      isExpired = diffTime <= 0;
    }

    return NextResponse.json({
      lake,
      daysRemaining,
      isExpired,
      plans: Object.values(SAAS_PLANS),
      paymentInfo: PAYMENT_INFO,
    });
  } catch (error: any) {
    console.error("Billing GET Error:", error);
    return NextResponse.json({ error: "Lỗi tải thông tin gói cước" }, { status: 500 });
  }
}

// API Tạo mã thanh toán VietQR
export async function POST(req: NextRequest) {
  try {
    const authResult = await getAuthLakeContext();
    if (!authResult.success) return authResult.response;
    const { lakeId } = authResult.context;

    const body = await req.json();
    const { planId } = body;

    const selectedPlan = (SAAS_PLANS as any)[planId];
    if (!selectedPlan || selectedPlan.price === 0) {
      return NextResponse.json({ error: "Gói cước không hợp lệ" }, { status: 400 });
    }

    // Nội dung chuyển khoản định danh duy nhất theo hồ
    const transferContent = `HOCAU ${lakeId.slice(-6).toUpperCase()} ${planId}`;

    // Link tạo mã VietQR chuẩn Napas 24/7
    const qrUrl = `https://img.vietqr.io/image/${PAYMENT_INFO.bankId}-${PAYMENT_INFO.accountNo}-compact2.png?amount=${selectedPlan.price}&addInfo=${encodeURIComponent(
      transferContent
    )}&accountName=${encodeURIComponent(PAYMENT_INFO.accountName)}`;

    return NextResponse.json({
      success: true,
      plan: selectedPlan,
      qrUrl,
      transferContent,
      paymentInfo: PAYMENT_INFO,
    });
  } catch (error: any) {
    console.error("Billing POST Error:", error);
    return NextResponse.json({ error: "Lỗi tạo yêu cầu thanh toán" }, { status: 500 });
  }
}
