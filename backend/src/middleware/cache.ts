import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { redisCache } from "../config/redis.js";

export const cacheMiddleware =
  (ttlSeconds = env.CACHE_TTL_SECONDS) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const scope = req.user
      ? `branch:${req.user.idBranch}:user:${req.user.idUser}`
      : "public";
    const key = `cache:${req.originalUrl}:${scope}`;

    const cached = await redisCache.get(key);

    if (cached) {
      try {
        res.json(JSON.parse(cached));
        return;
      } catch {
        await redisCache.del(key);
      }
    }

    const originalJson = res.json.bind(res);

    res.json = ((body: unknown) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        void redisCache.set(key, JSON.stringify(body), ttlSeconds);
      }

      return originalJson(body);
    }) as Response["json"];

    next();
  };

export const invalidateCache = async (prefixes: string[]): Promise<void> => {
  await Promise.all(prefixes.map((prefix) => redisCache.delByPrefix(prefix)));
};
