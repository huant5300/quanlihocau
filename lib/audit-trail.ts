import prisma from "@/lib/prisma";

export type AuditAction =
  | "SESSION_CANCEL"
  | "PRICE_OVERRIDE"
  | "DEBT_ADJUSTMENT"
  | "SESSION_EXTEND"
  | "FISH_BUYBACK_OVERRIDE"
  | "INVOICE_VOID"
  | "STAFF_ROLE_CHANGE"
  | "SYSTEM_CONFIG_CHANGE";

export interface LogAuditOptions {
  userId: string;
  lakeId?: string | null;
  action: AuditAction | string;
  details?: Record<string, any>;
}

/**
 * Ghi lại nhật ký kiểm toán (Audit Trail) cho các tác vụ trọng yếu của nhân viên/quản lý
 */
export async function logAuditTrail({
  userId,
  lakeId,
  action,
  details,
}: LogAuditOptions): Promise<boolean> {
  try {
    if (!userId) return false;

    if ((prisma as any).auditLog) {
      await (prisma as any).auditLog.create({
        data: {
          userId,
          lakeId: lakeId || null,
          action,
          details: details ? JSON.parse(JSON.stringify(details)) : undefined,
        },
      });
    }

    return true;
  } catch (error) {
    console.error("[Audit Trail Error]: Could not persist audit log:", error);
    return false;
  }
}
