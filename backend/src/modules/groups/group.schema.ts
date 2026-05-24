import { z } from "zod";

export const createGroupSchema = z
  .object({
    idBranch: z.coerce.number().int().positive(),
    groupName: z.string().trim().min(1).max(80),
  })
  .strict();

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
