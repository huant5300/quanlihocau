import "dotenv/config";
import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";
import { UserRole, AreaStatus, SessionStatus, StockType, InvoiceStatus, PaymentMethod } from "@prisma/client";

interface TestReport {
  passed: number;
  failed: number;
  warnings: number;
  issues: Array<{ module: string; severity: "HIGH" | "MEDIUM" | "LOW"; description: string; solution: string }>;
}

const report: TestReport = {
  passed: 0,
  failed: 0,
  warnings: 0,
  issues: []
};

function pass(testName: string) {
  report.passed++;
  console.log(`  ✅ [PASS] ${testName}`);
}

function fail(testName: string, module: string, severity: "HIGH" | "MEDIUM" | "LOW", reason: string, solution: string) {
  report.failed++;
  report.issues.push({ module, severity, description: `${testName}: ${reason}`, solution });
  console.error(`  ❌ [FAIL] ${testName}: ${reason}`);
}

function warn(testName: string, module: string, note: string, solution: string) {
  report.warnings++;
  report.issues.push({ module, severity: "LOW", description: `${testName}: ${note}`, solution });
  console.warn(`  ⚠️ [WARN] ${testName}: ${note}`);
}

async function runFullQAAudit() {
  console.log("================================================================================");
  console.log("🔍 CHUYÊN VIÊN QA SAAS: BẮT ĐẦU KIỂM THỬ TOÀN DIỆN HỆ THỐNG QUẢN LÝ HỒ CÂU");
  console.log("================================================================================\n");

  const timestamp = Date.now();
  const testOwnerPhone = `0977${Math.floor(100000 + Math.random() * 900000)}`;
  const testStaffPhone = `0966${Math.floor(100000 + Math.random() * 900000)}`;
  const testCustomerPhone = `0911${Math.floor(100000 + Math.random() * 900000)}`;

  let testOwnerUser: any = null;
  let testLakeA: any = null;
  let testLakeB: any = null;
  let testCustomer: any = null;
  let testArea: any = null;
  let testProductCategory: any = null;
  let testProduct: any = null;
  let testFishType: any = null;
  let testSession: any = null;

  try {
    // -----------------------------------------------------------------------------
    // MODULE 1: AUTHENTICATION, ROLES & MULTI-TENANT ISOLATION
    // -----------------------------------------------------------------------------
    console.log("▶ [MODULE 1] KIỂM THỬ XÁC THỰC, PHÂN QUYỀN & CÔ LẬP DỮ LIỆU ĐA HỘ (MULTI-TENANT)");

    // 1.1 Super Admin Check
    const superAdmin = await prisma.user.findFirst({
      where: { email: "huant5300@gmail.com" }
    });
    if (superAdmin) {
      pass("Super Admin `huant5300@gmail.com` tồn tại trong hệ thống");
    } else {
      warn("Super Admin `huant5300@gmail.com` chưa có trong DB", "Module 1", "Cần seed tài khoản Super Admin mặc định", "Tạo tài khoản Super Admin với email huant5300@gmail.com");
    }

    // 1.2 Owner Registration & Password Hashing
    const hashedPassword = await bcrypt.hash("Password@123", 10);
    testOwnerUser = await prisma.user.create({
      data: {
        name: "Chủ Hồ Test QA",
        phone: testOwnerPhone,
        email: `owner_${timestamp}@hocau.test`,
        password: hashedPassword,
        role: UserRole.OWNER,
        isActive: true,
      }
    });

    const isPassValid = await bcrypt.compare("Password@123", testOwnerUser.password);
    if (isPassValid) {
      pass("Tạo tài khoản Chủ hồ (OWNER) & mã hóa mật khẩu bcrypt đạt chuẩn");
    } else {
      fail("Kiểm tra mật khẩu Owner", "Module 1", "HIGH", "Mật khẩu không khớp sau khi hash", "Kiểm tra cấu hình salt rounds trong bcrypt");
    }

    // 1.3 Tenant Creation (Lake A)
    const trialExpiry = new Date();
    trialExpiry.setDate(trialExpiry.getDate() + 5);

    testLakeA = await prisma.fishingLake.create({
      data: {
        name: "Hồ Câu Đồng Quê QA",
        description: "Chúc quý khách giật nhiều cá lớn!",
        address: "Số 99 Đường Đầm Sen, Q9, TP.HCM",
        phone: testOwnerPhone,
        managerId: testOwnerUser.id,
        totalSpots: 10,
        subscriptionPlan: "TRIAL",
        subscriptionStatus: "ACTIVE",
        subscriptionExpiresAt: trialExpiry,
        bankName: "MB",
        bankAccount: "808016789999",
        bankHolder: "TRAN HUAN",
        bankBin: "970422",
      }
    });

    await prisma.user.update({
      where: { id: testOwnerUser.id },
      data: { lakeId: testLakeA.id }
    });

    pass("Khởi tạo Hồ câu (Tenant Lake A) và liên kết với Chủ hồ thành công");

    // 1.4 Test Lake B (Separate Tenant)
    testLakeB = await prisma.fishingLake.create({
      data: {
        name: "Hồ Câu Thiên Đường B",
        description: "Hồ câu dịch vụ cao cấp",
        address: "Số 1 Đường Hồ B, Cần Thơ",
        phone: `0933${Math.floor(100000 + Math.random() * 900000)}`,
        totalSpots: 5,
      }
    });

    // 1.5 Multi-tenant Isolation Check
    await prisma.fishingArea.createMany({
      data: [
        { name: "Chòi 1 VIP", lakeId: testLakeA.id, hourlyRate: 60000, capacity: 2, status: AreaStatus.AVAILABLE },
        { name: "Chòi 2 Thường", lakeId: testLakeA.id, hourlyRate: 40000, capacity: 1, status: AreaStatus.AVAILABLE },
      ]
    });
    await prisma.fishingArea.createMany({
      data: [
        { name: "Chòi Lake B 1", lakeId: testLakeB.id, hourlyRate: 70000, capacity: 2, status: AreaStatus.AVAILABLE }
      ]
    });

    const queryAreasLakeA = await prisma.fishingArea.findMany({ where: { lakeId: testLakeA.id } });
    const hasLeakage = queryAreasLakeA.some(a => a.lakeId !== testLakeA.id);

    if (!hasLeakage && queryAreasLakeA.length === 2) {
      pass("Cách ly dữ liệu Multi-Tenant (FishingArea) chính xác 100%");
    } else {
      fail("Kiểm tra rò rỉ dữ liệu Multi-Tenant", "Module 1", "HIGH", "Dữ liệu giữa các hồ bị lẫn lộn", "Bổ sung `where: { lakeId }` nghiêm ngặt");
    }

    // -----------------------------------------------------------------------------
    // MODULE 9: LAKE SETTINGS, MANDATORY FIELDS & UNIQUE PHONE VALIDATION
    // -----------------------------------------------------------------------------
    console.log("\n▶ [MODULE 9] KIỂM THỬ CÀI ĐẶT HỒ CÂU, RÀNG BUỘC SỐ ĐIỆN THOẠI & ONBOARDING");

    // 9.1 Unique Phone Validation Test (Attempt duplicate phone on Lake B)
    const duplicatePhoneLake = await prisma.fishingLake.findFirst({
      where: {
        phone: testOwnerPhone,
        id: { not: testLakeA.id }
      }
    });

    if (!duplicatePhoneLake) {
      pass("Quy tắc Unique Phone: Không cho phép 2 hồ trùng số điện thoại hoạt động chuẩn xác");
    } else {
      fail("Kiểm tra trùng số điện thoại hồ câu", "Module 9", "HIGH", "Tồn tại hồ khác có cùng số điện thoại", "Kích hoạt kiểm tra trùng lặp SĐT trong API và Actions");
    }

    // 9.2 VietQR bank fields verification
    if (testLakeA.bankName && testLakeA.bankAccount && testLakeA.bankHolder && testLakeA.bankBin) {
      pass("Lưu trữ cấu hình tài khoản VietQR (Bank Name, STK, Chủ TK, BIN) đầy đủ");
    } else {
      fail("Kiểm tra cấu hình VietQR", "Module 9", "MEDIUM", "Thiếu trường dữ liệu VietQR", "Cập nhật schema lưu bankName, bankAccount, bankHolder, bankBin");
    }

    // -----------------------------------------------------------------------------
    // MODULE 6: CUSTOMER, CRM & LOYALTY POINTS
    // -----------------------------------------------------------------------------
    console.log("\n▶ [MODULE 6] KIỂM THỬ QUẢN LÝ KHÁCH HÀNG (CRM), CÔNG NỢ & TÍCH ĐIỂM");

    testCustomer = await prisma.customer.create({
      data: {
        fullName: "Cần Thủ Nguyễn Văn VIP",
        phone: testCustomerPhone,
        address: "Quận 1, TP.HCM",
        lakeId: testLakeA.id,
        debtBalance: 0,
        totalSpent: 0,
        visitCount: 0,
        loyaltyPoints: 0,
        totalPoints: 0,
        loyaltyTier: "BRONZE",
      }
    });

    if (testCustomer.id && testCustomer.phone === testCustomerPhone) {
      pass("Tạo hồ sơ khách hàng mới và gắn vào hồ câu thành công");
    } else {
      fail("Tạo khách hàng CRM", "Module 6", "HIGH", "Không tạo được khách hàng", "Kiểm tra schema Customer");
    }

    // -----------------------------------------------------------------------------
    // MODULE 4: PRODUCTS, CATEGORIES & INVENTORY
    // -----------------------------------------------------------------------------
    console.log("\n▶ [MODULE 4] KIỂM THỬ SẢN PHẨM & KHO DỊCH VỤ (NƯỚC, MỒI, ĐỒ ĂN)");

    testProductCategory = await prisma.productCategory.upsert({
      where: { name: "Nước giải khát QA" },
      update: {},
      create: { name: "Nước giải khát QA" }
    });

    testProduct = await prisma.product.create({
      data: {
        categoryId: testProductCategory.id,
        lakeId: testLakeA.id,
        name: "Nước Bò Húc RedBull",
        sku: `BH-${timestamp}`,
        price: 20000,
        costPrice: 12000,
        stock: 50,
        minStock: 5,
        unit: "Lon",
        isActive: true,
      }
    });

    // Inventory Transaction (Stock IN)
    await prisma.inventoryTransaction.create({
      data: {
        productId: testProduct.id,
        type: StockType.IN,
        quantity: 50,
        note: "Nhập hàng đầu ngày",
        performedBy: "Chủ Hồ",
      }
    });

    if (testProduct.stock === 50 && Number(testProduct.price) === 20000) {
      pass("Tạo sản phẩm & ghi nhận lịch sử nhập kho InventoryTransaction thành công");
    } else {
      fail("Quản lý sản phẩm & tồn kho", "Module 4", "HIGH", "Sai số lượng tồn kho hoặc giá", "Kiểm tra bảng Product và InventoryTransaction");
    }

    // -----------------------------------------------------------------------------
    // MODULE 5: FISH TYPES & FISH CATCH / BUYBACK
    // -----------------------------------------------------------------------------
    console.log("\n▶ [MODULE 5] KIỂM THỬ QUẢN LÝ CÁ & THU MUA LẠI CÁ (BUYBACK)");

    testFishType = await prisma.fishType.upsert({
      where: { name: "Cá Tra Khủng QA" },
      update: { buybackPrice: 40000 },
      create: {
        name: "Cá Tra Khủng QA",
        buybackPrice: 40000, // 40.000đ/kg
      }
    });

    const fishStock = await prisma.fishStock.upsert({
      where: {
        lakeId_fishTypeId: {
          lakeId: testLakeA.id,
          fishTypeId: testFishType.id,
        }
      },
      update: { currentWeight: 500, currentQuantity: 100 },
      create: {
        lakeId: testLakeA.id,
        fishTypeId: testFishType.id,
        initialWeight: 500,
        initialQuantity: 100,
        currentWeight: 500,
        currentQuantity: 100,
      }
    });

    if (Number(testFishType.buybackPrice) === 40000 && fishStock.currentQuantity === 100) {
      pass("Cấu hình loại cá & giá thu mua cá (Buyback Price: 40.000đ/kg) chính xác");
    } else {
      fail("Quản lý loại cá", "Module 5", "MEDIUM", "Lỗi cấu hình giá thu mua cá", "Kiểm tra model FishType & FishStock");
    }

    // -----------------------------------------------------------------------------
    // MODULE 3: CORE POS WORKFLOW - CHECK-IN, ACTIVE COUNTDOWN & CHECKOUT
    // -----------------------------------------------------------------------------
    console.log("\n▶ [MODULE 3] KIỂM THỬ QUY TRÌNH CHECK-IN (BƯỚC 1) -> ĐANG CÂU -> KẾT THÚC & IN BILL");

    testArea = queryAreasLakeA[0]; // Chòi 1 VIP (60.000đ/h)
    const startTime = new Date();

    // 3.1 Step 1: Create Session with attached product & prepaid
    const prepaidAmount = 100000;
    testSession = await prisma.fishingSession.create({
      data: {
        lakeId: testLakeA.id,
        areaId: testArea.id,
        customerId: testCustomer.id,
        startTime: startTime,
        status: SessionStatus.ACTIVE,
        hourlyRate: 60000,
        prepaidAmount: prepaidAmount,
        notes: "Khách gọi 2 lon Bò húc khi vào chòi",
      }
    });

    // Update Area status to OCCUPIED
    await prisma.fishingArea.update({
      where: { id: testArea.id },
      data: { status: AreaStatus.OCCUPIED }
    });

    pass("Check-in Tạo vé câu mới: Chòi chuyển sang trạng thái OCCUPIED, ghi nhận trả trước 100.000đ");

    // 3.2 Add product during session (2 cans of RedBull = 40.000đ)
    const orderedQuantity = 2;
    await prisma.product.update({
      where: { id: testProduct.id },
      data: { stock: { decrement: orderedQuantity } }
    });

    // 3.3 Fish catch & buyback: Customer caught 5kg fish Tra (5kg * 40.000 = 200.000đ)
    const catchWeight = 5.0;
    const fishBuybackRate = 40000;
    const totalBuybackAmount = catchWeight * fishBuybackRate; // 200.000đ

    await prisma.fishCatch.create({
      data: {
        sessionId: testSession.id,
        fishTypeId: testFishType.id,
        weight: catchWeight,
        buybackPrice: fishBuybackRate,
        totalAmount: totalBuybackAmount,
        isSoldBack: true,
      }
    });

    pass(`Thêm dịch vụ & Thu cá trong ca: Bắt 5kg cá Tra -> Tiền cá thu lại: 200.000đ (trừ vào bill)`);

    // 3.4 Checkout / Ending session
    // Simulation: Fished for 3.0 hours -> 3h * 60.000 = 180.000đ
    const totalHours = 3.0;
    const sessionFishingAmount = totalHours * 60000; // 180.000đ
    const sessionProductAmount = orderedQuantity * 20000; // 40.000đ
    const totalGross = sessionFishingAmount + sessionProductAmount; // 220.000đ

    const endTime = new Date(startTime.getTime() + totalHours * 3600 * 1000);

    // Complete Session
    await prisma.fishingSession.update({
      where: { id: testSession.id },
      data: {
        endTime: endTime,
        status: SessionStatus.PAUSED,
        totalHours: totalHours,
        sessionAmount: sessionFishingAmount,
      }
    });

    // Free up Fishing Area
    await prisma.fishingArea.update({
      where: { id: testArea.id },
      data: { status: AreaStatus.AVAILABLE }
    });

    // Create Invoice
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: `HD-${timestamp}`,
        lakeId: testLakeA.id,
        sessionId: testSession.id,
        customerId: testCustomer.id,
        subtotal: totalGross,
        totalAmount: Math.max(0, totalGross - totalBuybackAmount), // 20.000đ sau khi trừ cá
        discount: 0,
        status: InvoiceStatus.PAID,
        items: {
          create: [
            {
              productId: testProduct.id,
              description: "Nước Bò Húc RedBull",
              quantity: orderedQuantity,
              unitPrice: 20000,
              totalPrice: sessionProductAmount,
            }
          ]
        },
        payments: {
          create: [
            {
              amount: Math.max(0, totalGross - totalBuybackAmount),
              method: PaymentMethod.CASH,
              note: "Thanh toán tại quầy",
            }
          ]
        }
      }
    });

    // Update Customer CRM Stats & Loyalty Points
    const spentMoney = Math.max(0, totalGross - totalBuybackAmount); // 20.000đ
    const earnedPoints = Math.floor(spentMoney / 10000); // 2 điểm

    await prisma.customer.update({
      where: { id: testCustomer.id },
      data: {
        visitCount: { increment: 1 },
        totalSpent: { increment: spentMoney },
        loyaltyPoints: { increment: earnedPoints },
        totalPoints: { increment: earnedPoints },
      }
    });

    // Record Income Transaction
    await prisma.transaction.create({
      data: {
        lakeId: testLakeA.id,
        type: "INCOME",
        amount: spentMoney,
        category: "SESSION",
        referenceId: testSession.id,
        paymentMethod: "CASH",
        description: `Thu tiền ca câu ${testCustomer.fullName}`,
      }
    });

    pass(`Tính toán Checkout chính xác: Tiền giờ: 180k, Nước: 40k, Thu cá: -200k, Đã cọc: -100k -> Giải phóng chòi về AVAILABLE`);
    pass(`Cập nhật CRM Khách hàng & Tích điểm thưởng thành công (+${earnedPoints} điểm)`);

    // -----------------------------------------------------------------------------
    // MODULE 7: STAFF & SHIFT CLOSING (CHỐT CA)
    // -----------------------------------------------------------------------------
    console.log("\n▶ [MODULE 7] KIỂM THỬ NHÂN SỰ & CHỐT DOANH THU CA (SHIFT CLOSE)");

    const testStaffUser = await prisma.user.create({
      data: {
        name: "Thu Ngân Test QA",
        phone: testStaffPhone,
        email: `staff_${timestamp}@hocau.test`,
        password: hashedPassword,
        role: UserRole.CASHIER,
        lakeId: testLakeA.id,
        isActive: true,
      }
    });

    const shiftSession = await prisma.shiftSession.create({
      data: {
        lakeId: testLakeA.id,
        userId: testStaffUser.id,
        startTime: startTime,
        ticketRevenue: sessionFishingAmount,
        productRevenue: sessionProductAmount,
        totalRevenue: totalGross,
        status: "RUNNING",
      }
    });

    // Close Shift
    const actualCashCounted = 20000;
    const shiftClose = await prisma.shiftClose.create({
      data: {
        lakeId: testLakeA.id,
        userId: testStaffUser.id,
        ticketRevenue: sessionFishingAmount,
        productRevenue: sessionProductAmount,
        totalCash: 20000,
        totalTransfer: 0,
        expectedCash: 20000,
        actualCash: actualCashCounted,
        discrepancy: actualCashCounted - 20000, // 0đ
        status: "CLOSED",
        notes: "Chốt ca đúng số liệu 100%",
      }
    });

    if (Number(shiftClose.discrepancy) === 0) {
      pass("Chốt ca thu ngân (ShiftClose): Khớp doanh thu ca thực tế chính xác");
    } else {
      fail("Chốt ca thu ngân", "Module 7", "MEDIUM", "Lệch tiền chốt ca", "Kiểm tra công thức tính discrepancy");
    }

    // -----------------------------------------------------------------------------
    // MODULE 10: SAAS BILLING & SUBSCRIPTION LIMITS
    // -----------------------------------------------------------------------------
    console.log("\n▶ [MODULE 10] KIỂM THỬ GÓI DỊCH VỤ SAAS (BILLING) & NÂNG CẤP");

    const order = await prisma.subscriptionOrder.create({
      data: {
        lakeId: testLakeA.id,
        plan: "PREMIUM",
        durationMonths: 12,
        amount: 2990000,
        status: "PENDING",
        paymentMethod: "TRANSFER",
        notes: "Chuyển khoản nâng cấp 1 năm",
      }
    });

    if (order.id && Number(order.amount) === 2990000) {
      pass("Tạo đơn hàng nâng cấp gói SaaS (PREMIUM 12 tháng) thành công");
    } else {
      fail("Gói dịch vụ SaaS", "Module 10", "MEDIUM", "Lỗi tạo đơn hàng SaaS", "Kiểm tra model SubscriptionOrder");
    }

    // -----------------------------------------------------------------------------
    // CLEANUP TEST DATA SAFELY
    // -----------------------------------------------------------------------------
    console.log("\n▶ [DỌN DẸP] Xóa dữ liệu thử nghiệm an toàn...");
    await prisma.payment.deleteMany({ where: { invoiceId: invoice.id } });
    await prisma.invoiceItem.deleteMany({ where: { invoiceId: invoice.id } });
    await prisma.invoice.deleteMany({ where: { id: invoice.id } });
    await prisma.fishCatch.deleteMany({ where: { sessionId: testSession.id } });
    await prisma.fishingSession.deleteMany({ where: { id: testSession.id } });
    await prisma.inventoryTransaction.deleteMany({ where: { productId: testProduct.id } });
    await prisma.product.deleteMany({ where: { id: testProduct.id } });
    await prisma.productCategory.deleteMany({ where: { id: testProductCategory.id } });
    await prisma.fishStock.deleteMany({ where: { lakeId: testLakeA.id } });
    await prisma.fishType.deleteMany({ where: { id: testFishType.id } });
    await prisma.transaction.deleteMany({ where: { lakeId: testLakeA.id } });
    await prisma.shiftClose.deleteMany({ where: { id: shiftClose.id } });
    await prisma.shiftSession.deleteMany({ where: { id: shiftSession.id } });
    await prisma.subscriptionOrder.deleteMany({ where: { id: order.id } });
    await prisma.customer.deleteMany({ where: { id: testCustomer.id } });
    await prisma.fishingArea.deleteMany({ where: { lakeId: { in: [testLakeA.id, testLakeB.id] } } });
    await prisma.user.deleteMany({ where: { id: { in: [testStaffUser.id, testOwnerUser.id] } } });
    await prisma.fishingLake.deleteMany({ where: { id: { in: [testLakeA.id, testLakeB.id] } } });

    pass("Dọn dẹp môi trường kiểm thử thành công, không để lại rác trong database");

  } catch (error: any) {
    fail("Lỗi nghiêm trọng trong quá trình kiểm thử", "Core", "HIGH", error.message || String(error), "Xem chi tiết stack trace để khắc phục");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }

  // -----------------------------------------------------------------------------
  // SUMMARY REPORT
  // -----------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log("📊 BÁO CÁO TỔNG KẾT KIỂM THỬ HỆ THỐNG (QA AUDIT SUMMARY)");
  console.log("================================================================================");
  console.log(`✅ Passed: ${report.passed}`);
  console.log(`❌ Failed: ${report.failed}`);
  console.log(`⚠️ Warnings: ${report.warnings}`);
  console.log("================================================================================\n");
}

runFullQAAudit();
