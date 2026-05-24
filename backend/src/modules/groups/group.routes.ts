import { Router } from "express";
import { asyncHandler } from "../../middleware/async-handler.js";
import { cacheMiddleware } from "../../middleware/cache.js";
import { validateBody } from "../../middleware/validate.js";
import { groupController } from "./group.controller.js";
import { createGroupSchema } from "./group.schema.js";

export const groupRouter = Router();

groupRouter.get("/", cacheMiddleware(), asyncHandler(groupController.list));
groupRouter.post(
  "/",
  validateBody(createGroupSchema),
  asyncHandler(groupController.create),
);
