import { Router } from "express";
import { asyncHandler } from "../../middleware/async-handler.js";
import { cacheMiddleware } from "../../middleware/cache.js";
import { validateBody } from "../../middleware/validate.js";
import { categoryController } from "./category.controller.js";
import { createCategorySchema } from "./category.schema.js";

export const categoryRouter = Router();

categoryRouter.get("/", cacheMiddleware(), asyncHandler(categoryController.list));
categoryRouter.post(
  "/",
  validateBody(createCategorySchema),
  asyncHandler(categoryController.create),
);
