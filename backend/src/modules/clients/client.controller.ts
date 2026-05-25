import type { Request, Response } from "express";
import { invalidateCache } from "../../middleware/cache.js";
import type { IdParams } from "../../schemas/common.schema.js";
import { requireAuthUser } from "../../utils/require-auth-user.js";
import { clientService } from "./client.service.js";
import type { CreateClientInput } from "./client.schema.js";

export const clientController = {
  async list(req: Request, res: Response): Promise<void> {
    const clients = await clientService.list(requireAuthUser(req));
    res.json(clients);
  },

  async create(req: Request, res: Response): Promise<void> {
    const client = await clientService.create(
      req.body as CreateClientInput,
      requireAuthUser(req),
    );
    await invalidateCache(["cache:/api/clients"]);
    res.status(201).json(client);
  },

  async findById(req: Request, res: Response): Promise<void> {
    const client = await clientService.findById(
      (req.params as unknown as IdParams).id,
      requireAuthUser(req),
    );
    res.json(client);
  },
};
