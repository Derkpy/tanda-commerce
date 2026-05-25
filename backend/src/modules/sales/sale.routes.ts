import { Router } from "express";
import { asyncHandler } from "../../middleware/async-handler.js";
import { cacheMiddleware } from "../../middleware/cache.js";
import { validateBody, validateParams } from "../../middleware/validate.js";
import { idParamsSchema } from "../../schemas/common.schema.js";
import { saleController } from "./sale.controller.js";
import { buildSaleSchema } from "./sale.schema.js";

export const saleRouter = Router();

saleRouter.get("/", cacheMiddleware(), asyncHandler(saleController.list));
saleRouter.post(
  "/build/preview",
  validateBody(buildSaleSchema),
  asyncHandler(saleController.previewBuild),
);
saleRouter.post(
  "/build",
  validateBody(buildSaleSchema),
  asyncHandler(saleController.build),
);
saleRouter.get(
  "/:id",
  validateParams(idParamsSchema),
  cacheMiddleware(),
  asyncHandler(saleController.findById),
);
