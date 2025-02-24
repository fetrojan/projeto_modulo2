import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { Product } from "../entities/Product";
import { User, UserProfile } from "../entities/User";
import { CreateProductDTO } from "../dtos/CreateProductDTO";
import AppError from "../utils/AppError";
import { Branch } from "../entities/Branch";
import { ProductResponseDTO } from "../dtos/ProductResponseDTO";

class ProductController {
    private userRepository
    private productRepository
    private branchRepository

    constructor() {
        this.userRepository = AppDataSource.getRepository(User);
        this.productRepository = AppDataSource.getRepository(Product);
        this.branchRepository = AppDataSource.getRepository(Branch);
    }

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const productBody = req.body as CreateProductDTO
            const userId = req.userId
            
            if (!productBody.name || !productBody.amount || !productBody.description) {
                throw new AppError("Os campos name, amount e description são obrigatórios", 400)
            }

            const currentBranch = await this.branchRepository.findOne({ where: {user :{id : userId}}, relations: ["user"] })

            if (!currentBranch) {
                throw new AppError("Branch não encontrada", 404)
            }

            const product = this.productRepository.create({
                name: productBody.name,
                amount: productBody.amount,
                description: productBody.description,
                url_cover: productBody.url_cover,
                branch: currentBranch,
            });

            await this.productRepository.save(product)

            res.status(201).json(new ProductResponseDTO(product));

        } catch (error) {
            next(error)
        }
    }

    getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.userId

            const currentBranch = await this.branchRepository.findOne({ where: {user :{id : userId}}, relations: ["products"]})

            if (!currentBranch) {
                throw new AppError("Branch não encontrada", 404)    
            }

            if (!currentBranch.products || currentBranch.products.length === 0) {
                res.status(200).json({ message: "Nenhum produto cadastrado para esta filial." });
                return
            }

            res.status(200).json(currentBranch.products)
        } catch (error) {
            next(error)
        }
    }
}

export default ProductController;