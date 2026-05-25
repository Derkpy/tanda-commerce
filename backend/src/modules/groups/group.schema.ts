import { z } from "zod";

export const createGroupSchema = z
  .object({
    groupName: z.string().trim().min(1).max(80),
  })
  .strict();

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
