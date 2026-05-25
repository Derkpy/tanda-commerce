import type { Request, Response } from "express";
import { requireAuthUser } from "../../utils/require-auth-user.js";
import { tandaService } from "./tanda.service.js";

export const tandaController = {
  async list(req: Request, res: Response): Promise<void> {
    const tandas = await tandaService.list(requireAuthUser(req));
    res.json(tandas);
  },
};
