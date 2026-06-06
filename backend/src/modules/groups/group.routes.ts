import { Router } from "express";
import { asyncHandler } from "../../middleware/async-handler.js";
import { cacheMiddleware } from "../../middleware/cache.js";
import { validateBody, validateParams } from "../../middleware/validate.js";
import { idParamsSchema } from "../../schemas/common.schema.js";
import { groupController } from "./group.controller.js";
import { createGroupSchema, updateGroupSchema } from "./group.schema.js";

export const groupRouter = Router();

groupRouter.get("/", cacheMiddleware(), asyncHandler(groupController.list));
groupRouter.post(
  "/",
  validateBody(createGroupSchema),
  asyncHandler(groupController.create),
);
groupRouter.put(
  "/:id",
  validateParams(idParamsSchema),
  validateBody(updateGroupSchema),
  asyncHandler(groupController.update),
);
groupRouter.delete(
  "/:id",
  validateParams(idParamsSchema),
  asyncHandler(groupController.delete),
);
