import { z } from "zod";

export const buildSaleSchema = z
  .object({
    clientId: z.coerce.number().int().positive(),
    products: z
      .array(
        z
          .object({
            code: z.string().trim().min(1).max(45),
            quantity: z.coerce.number().int().positive(),
            price: z.coerce.number().positive(),
          })
          .strict(),
      )
      .min(1),
    paymentCount: z.coerce.number().int().positive(),
    paymentIntervalDays: z.coerce.number().int().min(3).max(15),
    firstPaymentDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/),
  })
  .strict();

export type BuildSaleInput = z.infer<typeof buildSaleSchema>;
