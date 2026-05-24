import type { Request, Response } from "express";
import { tandaService } from "./tanda.service.js";

export const tandaController = {
  async list(_req: Request, res: Response): Promise<void> {
    const tandas = await tandaService.list();
    res.json(tandas);
  },
};
