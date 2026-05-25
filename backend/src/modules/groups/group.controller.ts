import type { Request, Response } from "express";
import { invalidateCache } from "../../middleware/cache.js";
import { requireAuthUser } from "../../utils/require-auth-user.js";
import { groupService } from "./group.service.js";
import type { CreateGroupInput } from "./group.schema.js";

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
};
