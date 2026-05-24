import type { Request, Response } from "express";
import { invalidateCache } from "../../middleware/cache.js";
import type { IdParams } from "../../schemas/common.schema.js";
import { clientService } from "./client.service.js";
import type { CreateClientInput } from "./client.schema.js";

export const clientController = {
  async list(_req: Request, res: Response): Promise<void> {
    const clients = await clientService.list();
    res.json(clients);
  },

  async create(
    req: Request<unknown, unknown, CreateClientInput>,
    res: Response,
  ): Promise<void> {
    const client = await clientService.create(req.body);
    await invalidateCache(["cache:/api/clients"]);
    res.status(201).json(client);
  },

  async findById(req: Request<IdParams>, res: Response): Promise<void> {
    const client = await clientService.findById(req.params.id);
    res.json(client);
  },
};
