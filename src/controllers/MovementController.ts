import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Branch } from "../entities/Branch";
import { Driver } from "../entities/Driver";
import { Movement, MovementStatus } from "../entities/Movement";
import { Product } from "../entities/Product";
import AppError from "../utils/AppError";

class MovementController {
    private movementRepository
    private branchRepository
    private productRepository
    private driverRepository


    constructor() {
        this.movementRepository = AppDataSource.getRepository(Movement);
        this.branchRepository = AppDataSource.getRepository(Branch);
        this.productRepository = AppDataSource.getRepository(Product);
        this.driverRepository = AppDataSource.getRepository(Driver);
    }

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { destination_branch_id, product_id, quantity } = req.body
            const userId = req.userId

            const branchRequesting = await this.branchRepository.findOne({where: {user : {id: userId}}})

            console.log(branchRequesting)

            if (!branchRequesting) {
                throw new AppError('Filial de origem não encontrada', 404)
            }

            const origin_branch_id = branchRequesting.id
            console.log(origin_branch_id)

            if(origin_branch_id === destination_branch_id) {
                throw new AppError('Não é possível transferir para a mesma filial', 400)
            }

            if (!destination_branch_id || !product_id || !quantity) {
                throw new AppError("Todos os campos são obrigatórios", 400);
            }

            if (quantity <= 0) {
                throw new AppError("A quantidade deve ser maior que zero", 400);
            }

            const destinationBranch = await this.branchRepository.findOne({
                where: { id: destination_branch_id }
            });
            console.log(destinationBranch)
            if (!destinationBranch) {
                throw new AppError("Filial de destino não encontrada", 404);
            }

            const product = await this.productRepository.findOne({
                where: { id: product_id, branch: { id: origin_branch_id } },
                relations: ["branch"]
            });
            
            if (!product) {
                throw new AppError("Produto não encontrado na filial de origem", 404);
            }

            if (quantity > product.amount) {
                throw new AppError("Estoque insuficiente para essa movimentação", 400);
            }

            product.amount -= quantity;
            await this.productRepository.save(product);


            const movement = this.movementRepository.create({
                destination_branch: destinationBranch,
                product: { id: product_id },
                quantity,
                status: MovementStatus.PENDING
            });

            await this.movementRepository.save(movement);

            res.status(201).json({ message: "Movimentação registrada com sucesso", movement });

        } catch (error) {
            next(error)
        }
    }
}

export default MovementController;