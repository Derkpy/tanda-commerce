import { Router } from "express";
import { asyncHandler } from "../../middleware/async-handler.js";
import { cacheMiddleware } from "../../middleware/cache.js";
import { tandaController } from "./tanda.controller.js";

export const tandaRouter = Router();

tandaRouter.get("/", cacheMiddleware(), asyncHandler(tandaController.list));
