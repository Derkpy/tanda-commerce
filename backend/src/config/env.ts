import "dotenv/config";
import { ZodError } from "zod";
import { envSchema, type Env } from "./env.schema.js";

export class EnvConfig {
  private static instance: Readonly<Env> | null = null;

  private constructor() {}

  static get values(): Readonly<Env> {
    if (!EnvConfig.instance) {
      EnvConfig.instance = Object.freeze(EnvConfig.validate());
    }

    return EnvConfig.instance;
  }

  static get<K extends keyof Env>(key: K): Env[K] {
    return EnvConfig.values[key];
  }

  private static validate(): Env {
    const result = envSchema.safeParse(process.env);

    if (!result.success) {
      throw new Error(EnvConfig.formatError(result.error));
    }

    return result.data;
  }

  private static formatError(error: ZodError): string {
    const details = error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");

    return `Invalid environment variables: ${details}`;
  }
}

export const env = EnvConfig.values;
