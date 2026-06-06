import type { Request, Response } from "express";
import { invalidateCache } from "../../middleware/cache.js";
import { requireAuthUser } from "../../utils/require-auth-user.js";
import { groupService } from "./group.service.js";
import type { CreateGroupInput, UpdateGroupInput } from "./group.schema.js";

export const groupController = {
  async list(req: Request, res: Response): Promise<void> {
    const groups = await groupService.list(requireAuthUser(req));
    res.json(groups);
  },

  async create(req: Request, res: Response): Promise<void> {
    const group = await groupService.create(
      req.body as CreateGroupInput,
      requireAuthUser(req),
    );
    await invalidateCache(["cache:/api/groups"]);
    res.status(201).json(group);
  },

  async update(req: Request, res: Response): Promise<void> {
    const group = await groupService.update(
      Number(req.params.id),
      req.body as UpdateGroupInput,
      requireAuthUser(req),
    );
    await invalidateCache(["cache:/api/groups", "cache:/api/categories", "cache:/api/products"]);
    res.json(group);
  },

  async delete(req: Request, res: Response): Promise<void> {
    await groupService.delete(Number(req.params.id), requireAuthUser(req));
    await invalidateCache(["cache:/api/groups", "cache:/api/categories", "cache:/api/products"]);
    res.status(204).send();
  },
};
