import type { Request, Response } from "express";
import { invalidateCache } from "../../middleware/cache.js";
import { requireAuthUser } from "../../utils/require-auth-user.js";
import { productService } from "./product.service.js";
import type {
  CreateProductInput,
  ProductCodeParams,
  UpdateProductInput,
} from "./product.schema.js";

const inventoryCachePrefixes = [
  "cache:/api/products",
  "cache:/api/categories",
  "cache:/api/groups",
];

export const productController = {
  async list(req: Request, res: Response): Promise<void> {
    const products = await productService.list(requireAuthUser(req));
    res.json(products);
  },

  async findByCode(req: Request, res: Response): Promise<void> {
    const product = await productService.findByCode(
      (req.params as unknown as ProductCodeParams).code,
      requireAuthUser(req),
    );
    res.json(product);
  },

  async create(req: Request, res: Response): Promise<void> {
    const product = await productService.create(
      req.body as CreateProductInput,
      requireAuthUser(req),
    );
    await invalidateCache(inventoryCachePrefixes);
    res.status(201).json(product);
  },

  async update(req: Request, res: Response): Promise<void> {
    const product = await productService.update(
      Number(req.params.id),
      req.body as UpdateProductInput,
      requireAuthUser(req),
    );
    await invalidateCache(inventoryCachePrefixes);
    res.json(product);
  },

  async delete(req: Request, res: Response): Promise<void> {
    await productService.delete(Number(req.params.id), requireAuthUser(req));
    await invalidateCache(inventoryCachePrefixes);
    res.status(204).send();
  },
};
