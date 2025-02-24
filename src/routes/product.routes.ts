import { Router } from "express";
import verifyToken from "../middlewares/auth";
import ProductController from "../controllers/ProductController";

const productRouter = Router();

const productController = new ProductController();

productRouter.post("/", verifyToken, productController.create);

export default productRouter;
