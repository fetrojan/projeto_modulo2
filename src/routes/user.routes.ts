import { Router } from "express";
import UserController from "../controllers/UserController";
import { isAdmin } from "../middlewares/isAdmin";
import verifyToken from "../middlewares/auth";

const userRouter = Router();

const userController = new UserController();

userRouter.post("/", verifyToken, isAdmin, userController.create);
userRouter.get("/", verifyToken, isAdmin, userController.getAll)
userRouter.get("/:id", verifyToken, userController.getById)
userRouter.put("/:id", verifyToken, userController.updateUser)
userRouter.patch("/:id/status", verifyToken, isAdmin, userController.updateStatus)

export default userRouter;
