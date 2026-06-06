import { z } from "zod";

const moneySchema = z.union([
  z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, "Price must use up to two decimals"),
  z.coerce.number().nonnegative(),
]);

const optionalMoneySchema = z.preprocess(
  (value) => (value === "" ? null : value),
  moneySchema.nullable().optional(),
);

export const createProductSchema = z
  .object({
    idCategory: z.coerce.number().int().positive(),
    nameProducts: z.string().trim().min(1).max(120),
    priceProduct: optionalMoneySchema,
  })
  .strict();

export const updateProductSchema = z
  .object({
    nameProducts: z.string().trim().min(1).max(120),
    priceProduct: optionalMoneySchema,
  })
  .strict();

export const productCodeParamsSchema = z
  .object({
    code: z.string().trim().min(1).max(45),
  })
  .strict();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type ProductCodeParams = z.infer<typeof productCodeParamsSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
