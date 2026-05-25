import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { authRouter } from "../modules/auth/auth.routes.js";
import { categoryRouter } from "../modules/categories/category.routes.js";
import { clientRouter } from "../modules/clients/client.routes.js";
import { groupRouter } from "../modules/groups/group.routes.js";
import { saleRouter } from "../modules/sales/sale.routes.js";
import { tandaRouter } from "../modules/tandas/tanda.routes.js";
import { userRouter } from "../modules/users/user.routes.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use(authMiddleware);
apiRouter.use("/clients", clientRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/tandas", tandaRouter);
apiRouter.use("/groups", groupRouter);
apiRouter.use("/categories", categoryRouter);
apiRouter.use("/sales", saleRouter);
