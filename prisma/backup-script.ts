/**
 * Database Backup Script
 * Run before migration: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/backup-script.ts
 * 
 * Exports critical tables to JSON for rollback safety.
 */
import prisma from "../lib/prisma";
import * as fs from "fs";
import * as path from "path";


async function backup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.join(__dirname, `backups/backup-${timestamp}`);
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  console.log(`📦 Starting backup to ${backupDir}...`);

  const tables = [
    { name: "users", fn: () => prisma.user.findMany() },
    { name: "customers", fn: () => prisma.customer.findMany() },
    { name: "fishingLakes", fn: () => prisma.fishingLake.findMany() },
    { name: "fishingAreas", fn: () => prisma.fishingArea.findMany() },
    { name: "fishingSessions", fn: () => prisma.fishingSession.findMany() },
    { name: "fishingPackages", fn: () => prisma.fishingPackage.findMany() },
    { name: "fishTypes", fn: () => prisma.fishType.findMany() },
    { name: "fishCatches", fn: () => prisma.fishCatch.findMany() },
    { name: "products", fn: () => prisma.product.findMany() },
    { name: "productCategories", fn: () => prisma.productCategory.findMany() },
    { name: "invoices", fn: () => prisma.invoice.findMany() },
    { name: "invoiceItems", fn: () => prisma.invoiceItem.findMany() },
    { name: "payments", fn: () => prisma.payment.findMany() },
    { name: "transactions", fn: () => prisma.transaction.findMany() },
    { name: "activityLogs", fn: () => prisma.activityLog.findMany() },
    { name: "notifications", fn: () => prisma.notification.findMany() },
    { name: "settings", fn: () => prisma.settings.findMany() },
  ];

  for (const table of tables) {
    try {
      const data = await table.fn();
      const filePath = path.join(backupDir, `${table.name}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`  ✅ ${table.name}: ${(data as any[]).length} records`);
    } catch (error: any) {
      console.log(`  ⚠️ ${table.name}: skipped (${error.message})`);
    }
  }

  console.log(`\n🎉 Backup complete! Files saved to: ${backupDir}`);
}

backup()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
