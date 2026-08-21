import "dotenv/config";
import prisma from "../lib/prisma";

async function clean() {
  const u = await prisma.user.findFirst({ where: { phone: "0988776655" } });
  if (u) {
    if (u.lakeId) {
      await prisma.fishingArea.deleteMany({ where: { lakeId: u.lakeId } });
      await prisma.fishingLake.deleteMany({ where: { id: u.lakeId } });
    }
    await prisma.activityLog.deleteMany({ where: { userId: u.id } });
    await prisma.user.delete({ where: { id: u.id } });
    console.log("✅ Đã dọn dẹp sạch sẽ tài khoản thử nghiệm!");
  }
}

clean().finally(() => prisma.$disconnect());
