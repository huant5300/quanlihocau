import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { getActiveLakeId } from "@/lib/lake-context";
import { UserRole } from "@prisma/client";

// Gói dịch vụ chuẩn SaaS QuanLiHoCau™ theo PRD §10
export const SAAS_PLANS_CONFIG = {
  TRIAL: {
    id: "TRIAL",
    name: "Gói Dùng Thử (TRIAL)",
    price: 0,
    monthlyPrice: 0,
    durationDays: 5,
    maxLakes: 1,
    badge: "Dùng thử 5 ngày Miễn Phí",
    description: "Trải nghiệm đầy đủ 100% tính năng quản lý hồ câu",
    features: [
      "Miễn phí 5 ngày dùng thử trọn gói",
      "Quản lý: 1 hồ câu độc lập",
      "Tối đa 2 nhân viên / thu ngân",
      "Bán vé, tính giờ & đếm ngược realtime",
      "Cảnh báo âm thanh & SOS nhấp nháy 15 phút",
      "Bán hàng POS mồi câu, nước, đồ ăn",
      "Thu cá & tự động khấu trừ vào hóa đơn",
      "Tự động tạo mã VietQR nhận tiền chuyển khoản",
      "In hóa đơn nhiệt Bluetooth 58mm (PT-210)",
    ],
  },
  SILVER: {
    id: "SILVER",
    name: "Gói Cơ Bản (BASIC / SILVER)",
    price: 99000,
    monthlyPrice: 99000,
    durationDays: 30,
    maxLakes: 1,
    badge: "Phổ biến nhất - 99k/tháng",
    description: "Phù hợp cho hồ câu độc lập, mở 1 hồ với FULL 100% chức năng",
    durations: [
      { months: 1, price: 99000, bonusMonths: 0, label: "1 Tháng", totalMonths: 1 },
      { months: 6, price: 594000, bonusMonths: 1, label: "6 Tháng (Tặng 1 tháng = 7 tháng)", totalMonths: 7, popular: true, avgMonthly: 84800 },
      { months: 12, price: 1188000, bonusMonths: 3, label: "1 Năm (Tặng 3 tháng = 15 tháng)", totalMonths: 15, bestValue: true, avgMonthly: 79200 },
    ],
    features: [
      "Mở tối đa: 1 Hồ câu độc quyền",
      "Tối đa 2 Nhân viên / Thu ngân",
      "FULL 100% tính năng không giới hạn",
      "Không giới hạn số ca câu & khách hàng",
      "Đồng hồ đếm giờ & cảnh báo quá giờ realtime",
      "Bán hàng POS mồi câu, nước ngọt, đồ ăn",
      "Cân cá & tự động trừ tiền vào hóa đơn",
      "Tự động tạo mã thanh toán VietQR động/tĩnh",
      "In hóa đơn máy in Bluetooth cầm tay 58mm",
      "Hoạt động Offline khi mất mạng (Dexie.js)",
      "Hỗ trợ kỹ thuật qua Zalo/Điện thoại 24/7",
    ],
  },
  GOLD: {
    id: "GOLD",
    name: "Gói Chuyên Nghiệp (PREMIUM / GOLD)",
    price: 199000,
    monthlyPrice: 199000,
    durationDays: 30,
    maxLakes: 5,
    badge: "Chuỗi 5 Hồ - 199k/tháng",
    description: "Dành cho chủ hồ quản lý chuỗi từ 2 đến 5 hồ câu / chi nhánh",
    durations: [
      { months: 1, price: 199000, bonusMonths: 0, label: "1 Tháng", totalMonths: 1 },
      { months: 6, price: 1194000, bonusMonths: 1, label: "6 Tháng (Tặng 1 tháng = 7 tháng)", totalMonths: 7, popular: true, avgMonthly: 170500 },
      { months: 12, price: 2388000, bonusMonths: 3, label: "1 Năm (Tặng 3 tháng = 15 tháng)", totalMonths: 15, bestValue: true, avgMonthly: 159200 },
    ],
    features: [
      "Quản lý chuỗi tối đa: 5 Hồ câu độc lập",
      "Tối đa 10 Nhân viên / Thu ngân",
      "FULL toàn bộ tính năng như Gói Cơ Bản",
      "Chuyển đổi linh hoạt giữa các hồ trên Topbar",
      "Báo cáo đối soát doanh thu chuỗi hồ câu",
      "Không giới hạn số lượng khách hàng lưu trữ",
      "Sao lưu & đồng bộ dữ liệu Realtime 24/7",
      "Ưu tiên cập nhật tính năng mới sớm nhất",
      "Ưu tiên hỗ trợ kỹ thuật VIP 1-kèm-1 24/7",
    ],
  },
};

// Thông tin tài khoản nhận tiền SaaS VietQR
export const PAYMENT_INFO = {
  bankId: process.env.SAAS_BANK_ID || "BIDV",
  bankBin: "970418",
  bankName: "BIDV (Ngân hàng Đầu tư & Phát triển Việt Nam)",
  accountNo: process.env.SAAS_ACCOUNT_NO || "8876045411",
  accountName: process.env.SAAS_ACCOUNT_NAME || "TRAN ANH HUAN",
};

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    let lakeId = await getActiveLakeId();

    // Nếu không có lakeId, tìm hồ đầu tiên trong DB
    if (!lakeId) {
      const firstLake = await prisma.fishingLake.findFirst({
        orderBy: { createdAt: "asc" }
      });
      if (firstLake) {
        lakeId = firstLake.id;
      }
    }

    // Nếu vẫn chưa có hồ nào trong hệ thống, tự động tạo hồ mặc định
    let lake = null;
    if (lakeId) {
      lake = await prisma.fishingLake.findUnique({
        where: { id: lakeId },
        select: {
          id: true,
          name: true,
          subscriptionPlan: true,
          subscriptionStatus: true,
          subscriptionExpiresAt: true,
          createdAt: true,
          phone: true,
          address: true,
        },
      });
    }

    if (!lake) {
      // Tự động tạo hồ ban đầu cho user
      lake = await prisma.fishingLake.create({
        data: {
          name: "Hồ câu dịch vụ",
          address: "Chưa cập nhật",
          phone: (session.user as any)?.phone || "0912345678",
          managerId: session.user.id,
          subscriptionPlan: "TRIAL",
          subscriptionStatus: "ACTIVE",
          subscriptionExpiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        },
      });
      lakeId = lake.id;
    }

    // Tính số ngày còn lại realtime
    let daysRemaining = 0;
    let isExpired = false;
    if (lake.subscriptionExpiresAt) {
      const now = new Date();
      const diffMs = new Date(lake.subscriptionExpiresAt).getTime() - now.getTime();
      daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      isExpired = diffMs <= 0;
    } else {
      // Mặc định gói dùng thử 5 ngày
      daysRemaining = 5;
      isExpired = false;
    }

    // Lấy lịch sử giao dịch/yêu cầu nâng cấp của hồ này
    const recentOrders = await prisma.subscriptionOrder.findMany({
      where: { lakeId: lake.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }).catch(() => []);

    return NextResponse.json({
      success: true,
      lake: {
        ...lake,
        subscriptionExpiresAt: lake.subscriptionExpiresAt ? lake.subscriptionExpiresAt.toISOString() : null,
      },
      daysRemaining,
      isExpired,
      plans: Object.values(SAAS_PLANS_CONFIG),
      paymentInfo: PAYMENT_INFO,
      orders: recentOrders.map(o => ({
        id: o.id,
        plan: o.plan,
        durationMonths: o.durationMonths,
        amount: Number(o.amount),
        status: o.status,
        createdAt: o.createdAt.toISOString(),
      })),
    });
  } catch (error: any) {
    console.error("Billing GET Error:", error);
    return NextResponse.json({ error: error.message || "Lỗi tải thông tin gói cước" }, { status: 500 });
  }
}

// API Tạo mã thanh toán VietQR & Ghi nhận yêu cầu
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const lakeId = await getActiveLakeId();
    if (!lakeId) {
      return NextResponse.json({ error: "Không tìm thấy hồ câu" }, { status: 400 });
    }

    const body = await req.json();
    const { planId, durationMonths = 1 } = body;

    const planConfig = (SAAS_PLANS_CONFIG as any)[planId];
    if (!planConfig || planConfig.price === 0) {
      return NextResponse.json({ error: "Gói cước không hợp lệ" }, { status: 400 });
    }

    // Tính giá theo thời hạn
    let amount = planConfig.price * durationMonths;
    let bonusMonths = 0;
    if (durationMonths === 6) {
      amount = planConfig.price * 6; // Gói 6 tháng
      bonusMonths = 1; // Tặng 1 tháng
    } else if (durationMonths === 12) {
      amount = planConfig.price * 12; // Gói 12 tháng
      bonusMonths = 3; // Tặng 3 tháng
    }

    // Tạo đơn hàng lưu vào DB (realtime tracking)
    const order = await prisma.subscriptionOrder.create({
      data: {
        lakeId: lakeId,
        plan: planId,
        durationMonths: Number(durationMonths),
        amount: amount,
        status: "PENDING",
        paymentMethod: "VIETQR",
      },
    });

    // Mã chuyển khoản duy nhất: HOCAU <MÃ_HỒ_6_KÝ_TỰ> <GÓI>
    const shortLakeId = lakeId.slice(-6).toUpperCase();
    const transferContent = `HOCAU ${shortLakeId} ${planId}`;

    // Tạo link ảnh VietQR chuẩn Napas 24/7
    const qrUrl = `https://img.vietqr.io/image/${PAYMENT_INFO.bankId}-${PAYMENT_INFO.accountNo}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(
      transferContent
    )}&accountName=${encodeURIComponent(PAYMENT_INFO.accountName)}`;

    return NextResponse.json({
      success: true,
      orderId: order.id,
      plan: planConfig,
      amount,
      durationMonths,
      bonusMonths,
      totalMonths: durationMonths + bonusMonths,
      qrUrl,
      transferContent,
      paymentInfo: PAYMENT_INFO,
    });
  } catch (error: any) {
    console.error("Billing POST Error:", error);
    return NextResponse.json({ error: error.message || "Lỗi tạo yêu cầu thanh toán" }, { status: 500 });
  }
}

// API Xác nhận kích hoạt gói cước ngay lập tức (Realtime Activation)
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const lakeId = await getActiveLakeId();
    if (!lakeId) {
      return NextResponse.json({ error: "Không tìm thấy hồ câu" }, { status: 400 });
    }

    const body = await req.json();
    const { planId, durationMonths = 1, orderId } = body;

    const planConfig = (SAAS_PLANS_CONFIG as any)[planId];
    if (!planConfig || planConfig.price === 0) {
      return NextResponse.json({ error: "Gói cước không hợp lệ" }, { status: 400 });
    }

    const currentLake = await prisma.fishingLake.findUnique({
      where: { id: lakeId },
    });

    if (!currentLake) {
      return NextResponse.json({ error: "Hồ câu không tồn tại" }, { status: 404 });
    }

    // Tính khuyến mãi: 12 tháng tặng 3 tháng (= 15 tháng), 6 tháng tặng 1 tháng (= 7 tháng)
    let bonusMonths = 0;
    if (durationMonths === 12) bonusMonths = 3;
    else if (durationMonths === 6) bonusMonths = 1;

    const totalActiveMonths = Number(durationMonths) + bonusMonths;

    // Tính thời gian hết hạn mới
    const now = new Date();
    let newExpiresAt = new Date();
    if (currentLake.subscriptionExpiresAt && new Date(currentLake.subscriptionExpiresAt) > now) {
      // Nếu còn hạn, cộng dồn tiếp
      newExpiresAt = new Date(currentLake.subscriptionExpiresAt);
      newExpiresAt.setMonth(newExpiresAt.getMonth() + totalActiveMonths);
    } else {
      // Nếu đã hết hạn hoặc đang dùng thử, tính từ hôm nay
      newExpiresAt.setMonth(now.getMonth() + totalActiveMonths);
    }

    // Cập nhật Database
    const updatedLake = await prisma.$transaction(async (tx) => {
      const lake = await tx.fishingLake.update({
        where: { id: lakeId },
        data: {
          subscriptionPlan: planId,
          subscriptionStatus: "ACTIVE",
          subscriptionExpiresAt: newExpiresAt,
        },
      });

      if (orderId) {
        await tx.subscriptionOrder.update({
          where: { id: orderId },
          data: { status: "APPROVED" },
        }).catch(() => null);
      }

      await tx.activityLog.create({
        data: {
          userId: session.user.id,
          lakeId: lakeId,
          action: "PAYMENT_UPGRADE",
          details: {
            plan: planId,
            planName: planConfig.name,
            durationMonths: durationMonths,
            bonusMonths: bonusMonths,
            totalMonths: totalActiveMonths,
            amount: planConfig.price * durationMonths,
            expiresAt: newExpiresAt.toISOString(),
          },
        },
      });

      return lake;
    });

    return NextResponse.json({
      success: true,
      message: `Chúc mừng bạn đã kích hoạt thành công ${planConfig.name} (+${totalActiveMonths} tháng)! 🎉`,
      lake: {
        ...updatedLake,
        subscriptionExpiresAt: updatedLake.subscriptionExpiresAt ? updatedLake.subscriptionExpiresAt.toISOString() : null,
      },
      plan: planConfig,
      expiresAt: newExpiresAt.toISOString(),
    });
  } catch (error: any) {
    console.error("Billing PUT Error:", error);
    return NextResponse.json({ error: error.message || "Lỗi kích hoạt gói cước" }, { status: 500 });
  }
}
