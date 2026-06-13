import { createClient, type RedisClientType } from "redis";
import { env } from "./env.js";
import { logger } from "./logger.js";

class RedisCache {
  private static client: RedisClientType | null = null;
  private static connecting: Promise<RedisClientType | null> | null = null;

  static async get(key: string): Promise<string | null> {
    const client = await RedisCache.getClient();

    if (!client) {
      return null;
    }

    try {
      return await client.get(key);
    } catch (error) {
      logger.warn({ error, key }, "Redis get failed");
      return null;
    }
  }

  static async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    const client = await RedisCache.getClient();

    if (!client) {
      return;
    }

    try {
      await client.set(key, value, { EX: ttlSeconds });
    } catch (error) {
      logger.warn({ error, key }, "Redis set failed");
    }
  }

  static async del(key: string): Promise<void> {
    const client = await RedisCache.getClient();

    if (!client) {
      return;
    }

    try {
      await client.del(key);
    } catch (error) {
      logger.warn({ error, key }, "Redis delete failed");
    }
  }

  static async delByPrefix(prefix: string): Promise<void> {
    const client = await RedisCache.getClient();

    if (!client) {
      return;
    }

    try {
      const keys: string[] = [];

      for await (const key of client.scanIterator({
        MATCH: `${prefix}*`,
        COUNT: 100,
      })) {
        keys.push(String(key));
      }

      if (keys.length > 0) {
        await client.del(keys);
      }
    } catch (error) {
      logger.warn({ error, prefix }, "Redis prefix delete failed");
    }
  }

  static async ping(): Promise<boolean> {
    const client = await RedisCache.getClient();

    if (!client) {
      return false;
    }

    try {
      return (await client.ping()) === "PONG";
    } catch (error) {
      logger.warn({ error }, "Redis ping failed");
      return false;
    }
  }

  static async disconnect(): Promise<void> {
    const client = RedisCache.client;
    RedisCache.client = null;
    RedisCache.connecting = null;

    if (!client) {
      return;
    }

    try {
      if (client.isOpen) {
        await client.quit();
      }
    } catch (error) {
      logger.warn({ error }, "Redis disconnect failed");
    }
  }

  private static async getClient(): Promise<RedisClientType | null> {
    if (RedisCache.client?.isOpen) {
      return RedisCache.client;
    }

    if (!RedisCache.connecting) {
      RedisCache.connecting = RedisCache.connect();
    }

    return RedisCache.connecting;
  }

  private static async connect(): Promise<RedisClientType | null> {
    const client = createClient({
      url: env.REDIS_URL,
      socket: {
        connectTimeout: 5_000,
        reconnectStrategy: false,
      },
    });

    client.on("error", (error) => {
      logger.warn({ error }, "Redis connection error");
    });

    try {
      await client.connect();
      RedisCache.client = client as RedisClientType;
      return RedisCache.client;
    } catch (error) {
      logger.warn({ error }, "Redis unavailable, continuing without cache");
      RedisCache.connecting = null;
      return null;
    }
  }
}

export const redisCache = RedisCache;
