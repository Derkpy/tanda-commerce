import type { Request, Response } from "express";
import { invalidateCache } from "../../middleware/cache.js";
import { groupService } from "./group.service.js";
import type { CreateGroupInput } from "./group.schema.js";

export const groupController = {
  async list(_req: Request, res: Response): Promise<void> {
    const groups = await groupService.list();
    res.json(groups);
  },

  async create(
    req: Request<unknown, unknown, CreateGroupInput>,
    res: Response,
  ): Promise<void> {
    const group = await groupService.create(req.body);
    await invalidateCache(["cache:/api/groups"]);
    res.status(201).json(group);
  },
};
