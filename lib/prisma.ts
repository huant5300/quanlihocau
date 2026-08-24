import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;
  
  // Configure pool for Serverless environment
  const pool = new Pool({ 
    connectionString,
    max: 2, // Keep small for serverless
    idleTimeoutMillis: 3000, // Close idle connections quickly to avoid "Server has closed the connection"
    connectionTimeoutMillis: 10000,
    ssl: connectionString?.includes("localhost") || connectionString?.includes("127.0.0.1")
      ? false 
      : { rejectUnauthorized: false },
  });
  
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

globalThis.prisma = prisma;
