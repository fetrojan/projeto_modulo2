import { Router } from "express";
import verifyToken from "../middlewares/auth";
import MovementController from "../controllers/MovementController";
import { isBranch } from "../middlewares/isBranch";
import { isDriver } from "../middlewares/isDriver";

const movementRouter = Router();

const movementController = new MovementController();

movementRouter.post("/", verifyToken, isBranch, movementController.create);
movementRouter.get("/", verifyToken, movementController.getAll);
movementRouter.patch("/:id/start", verifyToken, isDriver, movementController.updateStatusStart)

export default movementRouter;