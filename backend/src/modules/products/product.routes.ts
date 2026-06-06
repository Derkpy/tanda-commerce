import { Router } from "express";
import { asyncHandler } from "../../middleware/async-handler.js";
import { cacheMiddleware } from "../../middleware/cache.js";
import { validateBody, validateParams } from "../../middleware/validate.js";
import { idParamsSchema } from "../../schemas/common.schema.js";
import { productController } from "./product.controller.js";
import {
  createProductSchema,
  productCodeParamsSchema,
  updateProductSchema,
} from "./product.schema.js";

export const productRouter = Router();

productRouter.get("/", cacheMiddleware(), asyncHandler(productController.list));
productRouter.get(
  "/code/:code",
  validateParams(productCodeParamsSchema),
  cacheMiddleware(),
  asyncHandler(productController.findByCode),
);
productRouter.post(
  "/",
  validateBody(createProductSchema),
  asyncHandler(productController.create),
);
productRouter.put(
  "/:id",
  validateParams(idParamsSchema),
  validateBody(updateProductSchema),
  asyncHandler(productController.update),
);
productRouter.delete(
  "/:id",
  validateParams(idParamsSchema),
  asyncHandler(productController.delete),
);
