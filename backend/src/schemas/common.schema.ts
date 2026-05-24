import { z } from "zod";

export const idParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type IdParams = z.infer<typeof idParamsSchema>;
