import type { Request, Response } from "express";
import type { IdParams } from "../../schemas/common.schema.js";
import { requireAuthUser } from "../../utils/require-auth-user.js";
import { userService } from "./user.service.js";

export const userController = {
  async findById(req: Request, res: Response): Promise<void> {
    const user = await userService.findById(
      (req.params as unknown as IdParams).id,
      requireAuthUser(req),
    );
    res.json(user);
  },
};
