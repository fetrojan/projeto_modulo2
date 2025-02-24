import { Router } from "express";
import verifyToken from "../middlewares/auth";
import ProductController from "../controllers/ProductController";
import { isBranch } from "../middlewares/isBranch";

const productRouter = Router();

const productController = new ProductController();

productRouter.post("/", verifyToken, isBranch, productController.create);
productRouter.get("/", verifyToken, isBranch, productController.getAll);

export default productRouter;
