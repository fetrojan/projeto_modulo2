import { Router } from "express";
import UserController from "../controllers/UserController";
import { isAdmin } from "../middlewares/isAdmin";
import verifyToken from "../middlewares/auth";

const userRouter = Router();

const userController = new UserController();

userRouter.post("/", verifyToken, isAdmin, userController.create);


export default userRouter;
