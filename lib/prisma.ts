import { PrismaClient } from "@prisma/client";

const isTransientConnectionError = (error: any): boolean => {
  if (!error) return false;
  const msg = String(error?.message || error || "").toLowerCase();
  const code = String(error?.code || "");
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
    msg.includes("closed the connection") ||
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

const createPrismaClient = () => {
  const baseClient = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  return baseClient.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
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
globalThis.__prisma = prisma;

export default prisma;

