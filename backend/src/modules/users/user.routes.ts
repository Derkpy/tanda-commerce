import { Router } from "express";
import { asyncHandler } from "../../middleware/async-handler.js";
import { cacheMiddleware } from "../../middleware/cache.js";
import { validateParams } from "../../middleware/validate.js";
import { idParamsSchema } from "../../schemas/common.schema.js";
import { userController } from "./user.controller.js";

export const userRouter = Router();

userRouter.get(
  "/:id",
  validateParams(idParamsSchema),
  cacheMiddleware(),
  asyncHandler(userController.findById),
);
