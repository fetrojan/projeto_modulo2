import { Router } from "express";
import verifyToken from "../middlewares/auth";
import MovementController from "../controllers/MovementController";
import { isBranch } from "../middlewares/isBranch";

const movementRouter = Router();

const movementController = new MovementController();

movementRouter.post("/", verifyToken, isBranch, movementController.create);

export default movementRouter;