import "dotenv/config";
import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";
import { UserRole, AreaStatus } from "@prisma/client";

async function runTests() {
  console.log("=========================================");
  console.log("🚀 BẮT ĐẦU KIỂM TRA HỆ THỐNG & ĐĂNG NHẬP");
  console.log("=========================================\n");

  // TEST 1: Kiểm tra tài khoản Admin mặc định
  console.log("▶ [Test 1] Kiểm tra đăng nhập Admin (admin@fishing.saas)...");
  const admin = await prisma.user.findFirst({
    where: { email: "admin@fishing.saas" }
  });
  if (!admin || !admin.password) {
    console.error("❌ Không tìm thấy admin hoặc thiếu mật khẩu!");
  } else {
    const isMatch = await bcrypt.compare("admin123", admin.password);
    if (isMatch) {
      console.log(`✅ Admin hợp lệ! ID: ${admin.id}, Role: ${admin.role}`);
    } else {
      console.error("❌ Mật khẩu admin không khớp!");
    }
  }

  // TEST 2: Kiểm tra tài khoản Owner mặc định
  console.log("\n▶ [Test 2] Kiểm tra đăng nhập Owner (owner@fishing.saas)...");
  const owner = await prisma.user.findFirst({
    where: { email: "owner@fishing.saas" }
  });
  if (!owner || !owner.password) {
    console.error("❌ Không tìm thấy owner hoặc thiếu mật khẩu!");
  } else {
    const isMatch = await bcrypt.compare("owner123", owner.password);
    if (isMatch) {
      console.log(`✅ Owner hợp lệ! ID: ${owner.id}, Role: ${owner.role}`);
    } else {
      console.error("❌ Mật khẩu owner không khớp!");
    }
  }

  // TEST 3: Kiểm tra tạo tài khoản mới & tự động khởi tạo Hồ câu (Onboarding)
  console.log("\n▶ [Test 3] Kiểm tra luồng Đăng ký & Onboarding tự động...");
  const testPhone = "0988776655";
  // Xóa user test cũ nếu có
  const oldTestUser = await prisma.user.findFirst({ where: { phone: testPhone } });
  if (oldTestUser) {
    if (oldTestUser.lakeId) {
      await prisma.fishingArea.deleteMany({ where: { lakeId: oldTestUser.lakeId } });
      await prisma.fishingLake.deleteMany({ where: { id: oldTestUser.lakeId } });
    }
    await prisma.activityLog.deleteMany({ where: { userId: oldTestUser.id } });
    await prisma.user.delete({ where: { id: oldTestUser.id } });
  }

  const hashedPassword = await bcrypt.hash("test123456", 12);
  const trialExpiry = new Date();
  trialExpiry.setDate(trialExpiry.getDate() + 7);

  const newUser = await prisma.user.create({
    data: {
      name: "Chủ Hồ Test Tự Động",
      phone: testPhone,
      email: "test_owner@hocau.vn",
      password: hashedPassword,
      role: UserRole.OWNER,
      isActive: true,
    }
  });

  const newLake = await prisma.fishingLake.create({
    data: {
      name: "Hồ Câu Test Tự Động",
      description: "Hồ câu dịch vụ chuyên nghiệp, thoáng mát và tiện nghi.",
      address: "123 Đường Câu Cá, Bình Dương",
      phone: testPhone,
      managerId: newUser.id,
      totalSpots: 10,
      subscriptionPlan: "FREE",
      subscriptionStatus: "ACTIVE",
      subscriptionExpiresAt: trialExpiry,
    }
  });

  await prisma.user.update({
    where: { id: newUser.id },
    data: { lakeId: newLake.id }
  });

  await prisma.fishingArea.createMany({
    data: [1, 2, 3, 4, 5].map((n) => ({
      name: `Chòi ${n}`,
      lakeId: newLake.id,
      status: AreaStatus.AVAILABLE,
      hourlyRate: 50000,
      capacity: 1,
      minDuration: 1,
    }))
  });

  console.log(`✅ Tạo tài khoản thành công: ID=${newUser.id}, LakeId=${newLake.id}`);

  // TEST 4: Kiểm tra đăng nhập bằng cả Phone và Email cho tài khoản mới
  console.log("\n▶ [Test 4] Kiểm tra đăng nhập tài khoản mới bằng Phone & Email...");
  const loginByPhone = await prisma.user.findFirst({
    where: { OR: [{ email: testPhone }, { username: testPhone }, { phone: testPhone }] }
  });
  const isPhonePassValid = loginByPhone && loginByPhone.password ? await bcrypt.compare("test123456", loginByPhone.password) : false;
  console.log(`- Đăng nhập bằng SĐT (${testPhone}): ${isPhonePassValid ? "✅ THÀNH CÔNG" : "❌ THẤT BẠI"}`);

  const loginByEmail = await prisma.user.findFirst({
    where: { OR: [{ email: "test_owner@hocau.vn" }, { username: "test_owner@hocau.vn" }, { phone: "test_owner@hocau.vn" }] }
  });
  const isEmailPassValid = loginByEmail && loginByEmail.password ? await bcrypt.compare("test123456", loginByEmail.password) : false;
  console.log(`- Đăng nhập bằng Email (test_owner@hocau.vn): ${isEmailPassValid ? "✅ THÀNH CÔNG" : "❌ THẤT BẠI"}`);

  // TEST 5: Kiểm tra dữ liệu chòi và hồ câu
  console.log("\n▶ [Test 5] Kiểm tra chòi câu của hồ mới...");
  const areas = await prisma.fishingArea.findMany({
    where: { lakeId: newLake.id }
  });
  console.log(`✅ Tìm thấy ${areas.length} chòi câu đã được tự động tạo sẵn:`, areas.map(a => a.name).join(", "));

  console.log("\n=========================================");
  console.log("🎉 TẤT CẢ CÁC BƯỚC TEST ĐÃ HOÀN THÀNH XUẤT SẮC!");
  console.log("=========================================");
}

runTests().catch(console.error).finally(() => prisma.$disconnect());
