import type { Request, Response } from "express";
import { requireAuthUser } from "../../utils/require-auth-user.js";
import type { BuildSaleInput } from "../sales/sale.schema.js";
import { tandaService } from "./tanda.service.js";

export const tandaController = {
  async list(req: Request, res: Response): Promise<void> {
    const tandas = await tandaService.list(requireAuthUser(req));
    res.json(tandas);
  },

  async build(req: Request, res: Response): Promise<void> {
    const job = await tandaService.build(
      req.body as BuildSaleInput,
      requireAuthUser(req),
    );
    res.status(202).json(job);
  },
};
