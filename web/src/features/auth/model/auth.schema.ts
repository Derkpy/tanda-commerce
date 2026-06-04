import { z } from "zod";
import { t } from "@/shared/lib/i18n";

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, t("auth.login.validation.identifier_required"))
    .min(3, t("auth.login.validation.identifier_min"))
    .max(120, t("auth.login.validation.identifier_max")),
  password: z
    .string()
    .min(1, t("auth.login.validation.password_required"))
    .min(8, t("auth.login.validation.password_min"))
    .max(128, t("auth.login.validation.password_max")),
});

export const branchSchema = z
  .object({
    idBranch: z.coerce.number(),
    name: z.string(),
    localitation: z.string(),
  })
  .strict();

export const authUserSchema = z
  .object({
    idUser: z.coerce.number(),
    idBranch: z.coerce.number(),
    name: z.string(),
    email: z.string().email(),
    username: z.string(),
    phone: z.string().nullable().optional(),
    role: z.string(),
    status: z.string(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    branch: branchSchema.optional(),
  })
  .strict();

export type LoginValues = z.infer<typeof loginSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;
