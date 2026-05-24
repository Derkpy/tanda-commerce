import { z } from "zod";

export const buildSaleSchema = z
  .object({
    clientId: z.coerce.number().int().positive().optional(),
    branchId: z.coerce.number().int().positive().optional(),
    products: z
      .array(
        z
          .object({
            code: z.string().trim().min(1).max(45),
            quantity: z.coerce.number().int().positive(),
            price: z.coerce.number().positive().optional(),
          })
          .strict(),
      )
      .optional(),
    tandaConfig: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

export type BuildSaleInput = z.infer<typeof buildSaleSchema>;
