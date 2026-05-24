import { z } from "zod";

export const createClientSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    statusSingular: z.string().trim().max(45).optional(),
    statusGlobal: z.string().trim().max(45).optional(),
  })
  .strict();

export type CreateClientInput = z.infer<typeof createClientSchema>;
