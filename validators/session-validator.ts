import { z } from "zod";

export const startSessionSchema = z.object({
  lakeId: z.string().cuid(),
  areaId: z.string().cuid(),
  customerId: z.string().cuid().optional(),
});

export type StartSessionInput = z.infer<typeof startSessionSchema>;
