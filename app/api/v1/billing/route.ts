import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthLakeContext } from "@/lib/auth-guard";
import { UserRole } from "@prisma/client";

// Gói dịch vụ chuẩn SaaS QuanLiHoCau™
const SAAS_PLANS = {
  TRIAL: {
    id: "TRIAL",
    name: "Gói Dùng Thử Miễn Phí",
    price: 0,
    durationDays: 5,
    maxLakes: 1,
    badge: "5 ngày Free",
    description: "Trải nghiệm đầy đủ 100% tính năng quản lý hồ câu",
    features: [
      "Miễn phí 5 ngày dùng thử trọn gói",
      "Quản lý tối đa: 1 hồ câu",
      "Full toàn bộ tính năng bán vé & tính giờ",
      "Bán đồ uống, mồi câu & Cân thu mua cá",
      "Tự động tạo mã QR VietQR nhận tiền",
      "In hóa đơn nhiệt Bluetooth 58mm/80mm",
      "Báo cáo doanh thu & Thống kê khách hàng"
    ],
  },
  SILVER: {
    id: "SILVER",
    name: "Thành Viên Bạc (Silver)",
    price: 99000,
    durationDays: 30,
    maxLakes: 1,
    badge: "Tiết kiệm nhất - 99k/tháng",
    description: "Phù hợp cho hồ câu độc lập, mở 1 hồ với FULL tính năng",
    features: [
      "Mở tối đa: 1 Hồ câu độc lập",
      "FULL 100% tính năng không giới hạn",
      "Không giới hạn số ca câu & khách hàng",
      "Không giới hạn số lượng nhân viên / thu ngân",
      "Đồng hồ đếm giờ & cảnh báo quá giờ realtime",
      "Bán hàng POS mồi câu, nước ngọt, thuốc lá",
      "Cân cá & tự động trừ tiền vào hóa đơn",
      "Tích hợp mã thanh toán VietQR chuyển thẳng về tài khoản",
      "In hóa đơn máy in Bluetooth cầm tay",
      "Hỗ trợ kỹ thuật qua Zalo/Điện thoại 24/7"
    ],
  },
  GOLD: {
    id: "GOLD",
    name: "Thành Viên Vàng (Gold VIP)",
    price: 199000,
    durationDays: 30,
    maxLakes: 5,
    badge: "Chuỗi hồ - 199k/tháng",
    description: "Dành cho chủ hồ quản lý chuỗi từ 2 đến 5 hồ câu / chi nhánh",
    features: [
      "Quản lý chuỗi tối đa: 5 Hồ câu / Chi nhánh",
      "FULL 100% toàn bộ tính năng cao cấp",
      "Chuyển đổi linh hoạt giữa các hồ câu trên 1 tài khoản",
      "Không giới hạn ca câu, khách hàng & nhân viên",
      "Báo cáo đối soát doanh thu tổng hợp toàn chuỗi hồ",
      "Báo cáo sản phẩm bán chạy & Kỷ lục cần thủ",
      "Đồng bộ dữ liệu ngoại tuyến Offline-first",
      "Sao lưu dữ liệu tự động hàng ngày",
      "Ưu tiên hỗ trợ kỹ thuật VIP 1-kèm-1 24/7"
    ],
  },
};

// Thông tin tài khoản nhận tiền SaaS
const PAYMENT_INFO = {
  bankId: process.env.SAAS_BANK_ID || "BIDV",
  bankBin: "970418",
  bankName: "BIDV (Ngân hàng Đầu tư & Phát triển VN)",
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
    } else {
      // Nếu mới tạo chưa set expiresAt, mặc định cho 5 ngày dùng thử
      daysRemaining = 5;
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

// API Xác nhận kích hoạt gói sau khi chuyển khoản
export async function PUT(req: NextRequest) {
  try {
    const authResult = await getAuthLakeContext();
    if (!authResult.success) return authResult.response;
    const { lakeId, userId } = authResult.context;

    const body = await req.json();
    const { planId } = body;

    const selectedPlan = (SAAS_PLANS as any)[planId];
    if (!selectedPlan || selectedPlan.price === 0) {
      return NextResponse.json({ error: "Gói cước không hợp lệ" }, { status: 400 });
    }

    const currentLake = await prisma.fishingLake.findUnique({
      where: { id: lakeId },
    });

    if (!currentLake) {
      return NextResponse.json({ error: "Hồ câu không tồn tại" }, { status: 404 });
    }

    // Tính thời gian hết hạn mới (+30 ngày)
    const now = new Date();
    let newExpiresAt = new Date();
    if (currentLake.subscriptionExpiresAt && new Date(currentLake.subscriptionExpiresAt) > now) {
      newExpiresAt = new Date(currentLake.subscriptionExpiresAt);
      newExpiresAt.setDate(newExpiresAt.getDate() + 30);
    } else {
      newExpiresAt.setDate(now.getDate() + 30);
    }

    // Nâng cấp gói
    const updated = await prisma.fishingLake.update({
      where: { id: lakeId },
      data: {
        subscriptionPlan: planId,
        subscriptionStatus: "ACTIVE",
        subscriptionExpiresAt: newExpiresAt,
      },
    });

    // Ghi nhận ActivityLog
    if (userId) {
      await prisma.activityLog.create({
        data: {
          userId: userId,
          lakeId: lakeId,
          action: "PAYMENT_UPGRADE",
          details: {
            plan: planId,
            planName: selectedPlan.name,
            amount: selectedPlan.price,
            durationDays: 30,
            expiresAt: newExpiresAt.toISOString(),
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Chúc mừng bạn đã nâng cấp thành công lên ${selectedPlan.name}! 🎉`,
      lake: updated,
      plan: selectedPlan,
      expiresAt: newExpiresAt,
    });
  } catch (error: any) {
    console.error("Billing PUT Error:", error);
    return NextResponse.json({ error: "Lỗi kích hoạt gói cước" }, { status: 500 });
  }
}

