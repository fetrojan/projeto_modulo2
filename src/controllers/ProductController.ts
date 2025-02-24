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
            const requestingUser = req.profile
            const userId = req.userId
            
            if (!productBody.name || !productBody.amount || !productBody.description) {
                throw new AppError("Os campos name, amount e description são obrigatórios", 400)
            }

            if (requestingUser !== UserProfile.BRANCH) {
                throw new AppError("Somente usuários do tipo BRANCH podem criar produtos", 401)
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
}

export default ProductController;