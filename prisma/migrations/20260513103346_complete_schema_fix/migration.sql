-- AlterEnum
ALTER TYPE "SessionStatus" ADD VALUE 'OVERDUE';

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "lakeId" TEXT;

-- AlterTable
ALTER TABLE "FishingSession" ADD COLUMN     "packageId" TEXT,
ADD COLUMN     "prepaidAmount" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "lakeId" TEXT;

-- CreateTable
CREATE TABLE "FishingPackage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "durationHours" DOUBLE PRECISION NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FishingPackage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_lakeId_fkey" FOREIGN KEY ("lakeId") REFERENCES "FishingLake"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FishingSession" ADD CONSTRAINT "FishingSession_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "FishingPackage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_lakeId_fkey" FOREIGN KEY ("lakeId") REFERENCES "FishingLake"("id") ON DELETE SET NULL ON UPDATE CASCADE;
