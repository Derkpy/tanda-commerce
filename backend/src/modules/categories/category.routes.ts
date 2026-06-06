import { Router } from "express";
import { asyncHandler } from "../../middleware/async-handler.js";
import { cacheMiddleware } from "../../middleware/cache.js";
import { validateBody, validateParams } from "../../middleware/validate.js";
import { idParamsSchema } from "../../schemas/common.schema.js";
import { categoryController } from "./category.controller.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "./category.schema.js";

export const categoryRouter = Router();

categoryRouter.get("/", cacheMiddleware(), asyncHandler(categoryController.list));
categoryRouter.post(
  "/",
  validateBody(createCategorySchema),
  asyncHandler(categoryController.create),
);
categoryRouter.put(
  "/:id",
  validateParams(idParamsSchema),
  validateBody(updateCategorySchema),
  asyncHandler(categoryController.update),
);
categoryRouter.delete(
  "/:id",
  validateParams(idParamsSchema),
  asyncHandler(categoryController.delete),
);
