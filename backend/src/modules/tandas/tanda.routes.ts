import { Router } from "express";
import { asyncHandler } from "../../middleware/async-handler.js";
import { cacheMiddleware } from "../../middleware/cache.js";
import { validateBody } from "../../middleware/validate.js";
import { buildSaleSchema } from "../sales/sale.schema.js";
import { tandaController } from "./tanda.controller.js";

export const tandaRouter = Router();

tandaRouter.post(
  "/build",
  validateBody(buildSaleSchema),
  asyncHandler(tandaController.build),
);
tandaRouter.get("/", cacheMiddleware(), asyncHandler(tandaController.list));
