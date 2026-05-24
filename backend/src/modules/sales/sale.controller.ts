import type { Request, Response } from "express";
import type { IdParams } from "../../schemas/common.schema.js";
import { saleService } from "./sale.service.js";
import type { BuildSaleInput } from "./sale.schema.js";

export const saleController = {
  async list(_req: Request, res: Response): Promise<void> {
    const sales = await saleService.list();
    res.json(sales);
  },

  async findById(req: Request<IdParams>, res: Response): Promise<void> {
    const sale = await saleService.findById(req.params.id);
    res.json(sale);
  },

  async build(
    req: Request<unknown, unknown, BuildSaleInput>,
    res: Response,
  ): Promise<void> {
    const result = saleService.build(req.body);
    res.json(result);
  },
};
