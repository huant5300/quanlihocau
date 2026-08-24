import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool, PoolConfig } from "pg";

const connectionString = process.env.DATABASE_URL;

const poolConfig: PoolConfig = {
  connectionString,
  max: 10,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: true,
  ssl: connectionString?.includes("localhost") || connectionString?.includes("127.0.0.1")
    ? false
    : { rejectUnauthorized: false },
};

const createPrismaClient = () => {
  const pool = new Pool(poolConfig);
  pool.on("error", (err) => {
    console.warn("[Database Pool] Idle connection error caught safely:", err.message);
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const prisma = globalThis.__prisma ?? createPrismaClient();
globalThis.__prisma = prisma;

export default prisma;
