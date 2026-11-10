// Safe Prisma Client helper
// Allows seamless compilation whether Prisma Client has been generated or not.
/* eslint-disable @typescript-eslint/no-explicit-any */
let PrismaClient: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require("@prisma/client");
  PrismaClient = mod.PrismaClient;
} catch {
  PrismaClient = null;
}

const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

export const prisma: any =
  globalForPrisma.prisma ??
  (PrismaClient
    ? new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
      })
    : null);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
