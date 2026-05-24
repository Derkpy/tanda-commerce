import { Router } from "express";
import { cacheMiddleware } from "../../middleware/cache.js";
import { asyncHandler } from "../../middleware/async-handler.js";
import { validateBody, validateParams } from "../../middleware/validate.js";
import { idParamsSchema } from "../../schemas/common.schema.js";
import { clientController } from "./client.controller.js";
import { createClientSchema } from "./client.schema.js";

export const clientRouter = Router();

clientRouter.get("/", cacheMiddleware(), asyncHandler(clientController.list));
clientRouter.post(
  "/",
  validateBody(createClientSchema),
  asyncHandler(clientController.create),
);
clientRouter.get(
  "/:id",
  validateParams(idParamsSchema),
  cacheMiddleware(),
  asyncHandler(clientController.findById),
);
