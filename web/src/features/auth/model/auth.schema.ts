import { z } from "zod";

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Ingresa tu correo o usuario.")
    .min(3, "El correo o usuario debe tener al menos 3 caracteres.")
    .max(120, "El correo o usuario no puede exceder 120 caracteres."),
  password: z
    .string()
    .min(1, "Ingresa tu contrasena.")
    .min(8, "La contrasena debe tener al menos 8 caracteres.")
    .max(128, "La contrasena no puede exceder 128 caracteres."),
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
    role: z.string(),
    status: z.string(),
    branch: branchSchema.optional(),
  })
  .strict();

export type LoginValues = z.infer<typeof loginSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;
