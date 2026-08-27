import { Pool, PoolConfig } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const isTransientConnectionError = (error: any): boolean => {
  if (!error) return false;
  const msg = (
    String(error?.message || "") +
    " " +
    String(error?.cause?.message || "") +
    " " +
    String(error?.stack || "") +
    " " +
    String(error || "")
  ).toLowerCase();
  const code = String(error?.code || error?.cause?.code || "");
  return (
    msg.includes("server has closed the connection") ||
    msg.includes("connection terminated unexpectedly") ||
    msg.includes("connection closed") ||
    msg.includes("econnreset") ||
    msg.includes("etimedout") ||
    msg.includes("broken pipe") ||
    msg.includes("socket hang up") ||
    msg.includes("p1017") ||
    msg.includes("p1001") ||
    msg.includes("p2024") ||
    msg.includes("p2010") ||
    msg.includes("closed the connection") ||
    msg.includes("can't reach database server") ||
    msg.includes("terminating connection") ||
    code === "57P01" ||
    code === "57P02" ||
    code === "57P03" ||
    code === "08006" ||
    code === "08001" ||
    code === "08004" ||
    code === "ECONNRESET" ||
    code === "ETIMEDOUT"
  );
};

const SOFT_DELETE_MODELS = new Set([
  "User",
  "Customer",
  "FishingLake",
  "FishingArea",
  "FishingSession",
  "Product",
  "Invoice",
  "InvoiceItem",
  "FishCatch",
  "FishType",
  "FishStock",
  "InventoryTransaction",
  "Expense",
]);

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL;
  const poolConfig: PoolConfig = {
    connectionString,
    max: 10,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
    allowExitOnIdle: true,
  };

  const pool = new Pool(poolConfig);

  pool.on("error", (err) => {
    console.warn("[PG Pool Warning] Idle client connection drop:", err.message);
  });

  const adapter = new PrismaPg(pool);

  const baseClient = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  return baseClient.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          // Soft delete filtering logic - only for models with deletedAt and safe read operations
          const isSoftDeleteOperation = 
            operation === "findFirst" ||
            operation === "findMany" ||
            operation === "count" ||
            operation === "aggregate";
            
          if (model && SOFT_DELETE_MODELS.has(model) && isSoftDeleteOperation) {
            // @ts-ignore
            if (!args.where) {
              // @ts-ignore
              args.where = { deletedAt: null };
            } else {
              // @ts-ignore
              if (args.where.deletedAt === undefined) {
                // @ts-ignore
                args.where.deletedAt = null;
              }
            }
          }

          const maxRetries = 3;
          let attempt = 0;
          while (true) {
            try {
              return await query(args);
            } catch (error: any) {
              attempt++;
              if (attempt <= maxRetries && isTransientConnectionError(error)) {
                const backoffMs = attempt * 150;
                console.warn(
                  `[Prisma Auto-Retry] Reconnecting and retrying ${model}.${operation} (attempt ${attempt}/${maxRetries}) after transient drop...`
                );
                await new Promise((resolve) => setTimeout(resolve, backoffMs));
                continue;
              }
              throw error;
            }
          }
        },
      },
    },
  });
};

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;

declare global {
  // eslint-disable-next-line no-var
  var __prisma: ExtendedPrismaClient | undefined;
}

const prisma = (globalThis.__prisma ?? createPrismaClient()) as ExtendedPrismaClient;
if (process.env.NODE_ENV !== 'production') globalThis.__prisma = prisma;

export default prisma;
