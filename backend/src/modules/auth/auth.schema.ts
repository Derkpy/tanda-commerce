import { z } from "zod";

export const loginBodySchema = z
  .object({
    identifier: z.string().trim().min(1).max(180),
    password: z.string().min(1).max(256),
  })
  .strict();

export type LoginBody = z.infer<typeof loginBodySchema>;
