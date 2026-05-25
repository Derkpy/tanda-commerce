import type { Request, Response } from "express";
import { ApiError } from "../../errors/api-error.js";
import type { IdParams } from "../../schemas/common.schema.js";
import { saleService, type AuthContext } from "./sale.service.js";
import type { BuildSaleInput } from "./sale.schema.js";

export const saleController = {
  async list(req: Request, res: Response): Promise<void> {
    const sales = await saleService.list(getAuthContext(req));
    res.json(sales);
  },

  async findById(req: Request, res: Response): Promise<void> {
    const sale = await saleService.findById(
      (req.params as unknown as IdParams).id,
      getAuthContext(req),
    );
    res.json(sale);
  },

  async previewBuild(req: Request, res: Response): Promise<void> {
    const preview = await saleService.previewBuild(
      req.body as BuildSaleInput,
      getAuthContext(req),
    );
    res.json(preview);
  },

  async build(req: Request, res: Response): Promise<void> {
    const sale = await saleService.build(
      req.body as BuildSaleInput,
      getAuthContext(req),
    );
    res.status(201).json(sale);
  },
};

type RequestWithAuth = Request & {
  user?: AuthContext;
};

const getAuthContext = (req: Request<any, any, any, any>): AuthContext => {
  const user = (req as RequestWithAuth).user;

  if (!user) {
    throw new ApiError(401, "Authentication required");
  }

  return user;
};
