import { z } from "zod";

export const createCategorySchema = z
  .object({
    idGroup: z.coerce.number().int().positive(),
    categoryName: z.string().trim().min(1).max(80),
  })
  .strict();

export const updateCategorySchema = z
  .object({
    categoryName: z.string().trim().min(1).max(80),
  })
  .strict();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
