import type { Request, Response } from "express";
import { invalidateCache } from "../../middleware/cache.js";
import { categoryService } from "./category.service.js";
import type { CreateCategoryInput } from "./category.schema.js";

export const categoryController = {
  async list(_req: Request, res: Response): Promise<void> {
    const categories = await categoryService.list();
    res.json(categories);
  },

  async create(
    req: Request<unknown, unknown, CreateCategoryInput>,
    res: Response,
  ): Promise<void> {
    const category = await categoryService.create(req.body);
    await invalidateCache(["cache:/api/categories", "cache:/api/groups"]);
    res.status(201).json(category);
  },
};
