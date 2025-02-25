import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Branch } from "../entities/Branch";
import { Driver } from "../entities/Driver";
import { Movement, MovementStatus } from "../entities/Movement";
import { Product } from "../entities/Product";
import AppError from "../utils/AppError";
import { User, UserProfile } from "../entities/User";
import { MovementDTO } from "../dtos/MovementDTO";

class MovementController {
    private movementRepository
    private branchRepository
    private productRepository
    private driverRepository
    private userRepository


    constructor() {
        this.movementRepository = AppDataSource.getRepository(Movement);
        this.branchRepository = AppDataSource.getRepository(Branch);
        this.productRepository = AppDataSource.getRepository(Product);
        this.driverRepository = AppDataSource.getRepository(Driver);
        this.userRepository = AppDataSource.getRepository(User);
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

    getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const profile = req.profile
            const userId = req.userId

            if(profile !== UserProfile.BRANCH && profile !== UserProfile.DRIVER) {
                throw new AppError("Apenas motoristas e filiais podem acessar essa rota", 403)
            }

            const movements = await this.movementRepository.find({
                    where: { destination_branch: { user: { id: userId } } },
                    select: {
                        id: true,
                        quantity: true,
                        status: true,
                        created_at: true,
                        updated_at: true,
                        product: {
                            id: true,
                            name: true,
                            description: true
                        },
                        destination_branch: {
                            id: true,
                        }
                    },
                    relations: ["product", "destination_branch"]
                });
            
                const response: MovementDTO[] = movements.map(movement => ({
                    id: movement.id,
                    quantity: movement.quantity,
                    status: movement.status,
                    created_at: movement.created_at,
                    updated_at: movement.updated_at,
                    product: movement.product
                        ? {
                            id: movement.product.id,
                            name: movement.product.name,
                            description: movement.product.description
                        }
                        : null,
                    destination_branch_id: movement.destination_branch?.id ?? null
                }));

            res.status(200).json(response)

        } catch (error) {
            next(error)
        }
    }
}

export default MovementController;