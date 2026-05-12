import { SessionRepository } from "@/repositories/session-repository";
import { differenceInMinutes } from "date-fns";

export class SessionService {
  static async startSession(lakeId: string, areaId: string, customerId?: string) {
    // 1. Check if area is available
    // 2. Create session
    return SessionRepository.create({
      lake: { connect: { id: lakeId } },
      area: { connect: { id: areaId } },
      customer: customerId ? { connect: { id: customerId } } : undefined,
      status: "ACTIVE",
      hourlyRate: 50000, // This should come from area
    });
  }

  static async completeSession(sessionId: string) {
    const session = await SessionRepository.findById(sessionId);
    if (!session) throw new Error("Session not found");

    const endTime = new Date();
    const durationMinutes = differenceInMinutes(endTime, session.startTime);
    const durationHours = durationMinutes / 60;
    
    // Logic: min 1 hour, then proportional
    const billableHours = Math.max(1, durationHours);
    const amount = Number(session.hourlyRate) * billableHours;

    return SessionRepository.update(sessionId, {
      endTime,
      status: "COMPLETED",
      totalHours: durationHours,
      sessionAmount: amount,
    });
  }
}
