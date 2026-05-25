import type { FieldValues, Resolver } from "react-hook-form";
import type { z } from "zod";

export function createZodResolver<TFieldValues extends FieldValues>(
  schema: z.ZodType<TFieldValues>,
): Resolver<TFieldValues> {
  return async (values) => {
    const result = schema.safeParse(values);

    if (result.success) {
      return {
        errors: {},
        values: result.data,
      };
    }

    const errors: Record<string, { message: string; type: string }> = {};

    for (const issue of result.error.issues) {
      const path = issue.path.join(".");

      if (!path || errors[path]) {
        continue;
      }

      errors[path] = {
        message: issue.message,
        type: issue.code,
      };
    }

    return {
      errors: errors as never,
      values: {} as TFieldValues,
    };
  };
}
