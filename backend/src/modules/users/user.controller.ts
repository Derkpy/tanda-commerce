import type { Request, Response } from "express";
import type { IdParams } from "../../schemas/common.schema.js";
import { userService } from "./user.service.js";

export const userController = {
  async findById(req: Request<IdParams>, res: Response): Promise<void> {
    const user = await userService.findById(req.params.id);
    res.json(user);
  },
};
