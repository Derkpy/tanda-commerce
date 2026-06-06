import type { Request, Response } from "express";
import { invalidateCache } from "../../middleware/cache.js";
import { requireAuthUser } from "../../utils/require-auth-user.js";
import { categoryService } from "./category.service.js";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./category.schema.js";

export const categoryController = {
  async list(req: Request, res: Response): Promise<void> {
    const categories = await categoryService.list(requireAuthUser(req));
    res.json(categories);
  },

  async create(req: Request, res: Response): Promise<void> {
    const category = await categoryService.create(
      req.body as CreateCategoryInput,
      requireAuthUser(req),
    );
    await invalidateCache(["cache:/api/categories", "cache:/api/groups"]);
    res.status(201).json(category);
  },

  async update(req: Request, res: Response): Promise<void> {
    const category = await categoryService.update(
      Number(req.params.id),
      req.body as UpdateCategoryInput,
      requireAuthUser(req),
    );
    await invalidateCache(["cache:/api/categories", "cache:/api/groups", "cache:/api/products"]);
    res.json(category);
  },

  async delete(req: Request, res: Response): Promise<void> {
    await categoryService.delete(Number(req.params.id), requireAuthUser(req));
    await invalidateCache(["cache:/api/categories", "cache:/api/groups", "cache:/api/products"]);
    res.status(204).send();
  },
};
