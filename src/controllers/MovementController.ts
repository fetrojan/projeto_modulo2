import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Branch } from "../entities/Branch";
import { Driver } from "../entities/Driver";
import { Movement, MovementStatus } from "../entities/Movement";
import { Product } from "../entities/Product";
import AppError from "../utils/AppError";
import { UserProfile } from "../entities/User";
import { MovementResponseDTO } from "../dtos/MovementResponseDTO";

class MovementController {
  private movementRepository;
  private branchRepository;
  private productRepository;
  private driverRepository;
  

  constructor() {
    this.movementRepository = AppDataSource.getRepository(Movement);
    this.branchRepository = AppDataSource.getRepository(Branch);
    this.productRepository = AppDataSource.getRepository(Product);
    this.driverRepository = AppDataSource.getRepository(Driver);
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { destination_branch_id, product_id, quantity } = req.body;
      const userId = req.userId;

      const branchRequesting = await this.branchRepository.findOne({
        where: { user: { id: userId } },
      });

      console.log(branchRequesting);

      if (!branchRequesting) {
        throw new AppError("Filial de origem não encontrada", 404);
      }

      const origin_branch_id = branchRequesting.id;
      console.log(origin_branch_id);

      if (origin_branch_id === destination_branch_id) {
        throw new AppError(
          "Não é possível transferir para a mesma filial",
          400
        );
      }

      if (!destination_branch_id || !product_id || !quantity) {
        throw new AppError("Todos os campos são obrigatórios", 400);
      }

      if (quantity <= 0) {
        throw new AppError("A quantidade deve ser maior que zero", 400);
      }

      const destinationBranch = await this.branchRepository.findOne({
        where: { id: destination_branch_id },
      });
      console.log(destinationBranch);
      if (!destinationBranch) {
        throw new AppError("Filial de destino não encontrada", 404);
      }

      const product = await this.productRepository.findOne({
        where: { id: product_id, branch: { id: origin_branch_id } },
        relations: ["branch"],
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
        product: { id: product_id, name: product.name },
        quantity,
        status: MovementStatus.PENDING,
      });

      await this.movementRepository.save(movement);

      res
        .status(201)
        .json({ message: "Movimentação registrada com sucesso", movement });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const profile = req.profile;
      const userId = req.userId;

      if (profile !== UserProfile.BRANCH && profile !== UserProfile.DRIVER) {
        throw new AppError(
          "Apenas motoristas e filiais podem acessar essa rota",
          403
        );
      }

      let whereCondition = {};

      const movements = await this.movementRepository.find({
        where: whereCondition,
        select: {
          id: true,
          quantity: true,
          status: true,
          created_at: true,
          updated_at: true,
          product: {
            id: true,
            name: true,
            description: true,
          },
          destination_branch: {
            id: true,
          },
          driver: {
            id: true,
            user: {
              name: true,
            },
          },
        },
        relations: ["product", "destination_branch", "driver", "driver.user"],
      });

      const response: MovementResponseDTO[] = movements.map(
        (movement) =>
          new MovementResponseDTO(
            movement.id,
            movement.quantity,
            movement.status,
            movement.created_at,
            movement.updated_at,
            movement.product
              ? {
                  id: movement.product.id,
                  name: movement.product.name,
                  description: movement.product.description,
                }
              : null,
            movement.destination_branch ? movement.destination_branch.id : null,
            movement.driver
              ? {
                  id: movement.driver.id,
                  name: movement.driver.user.name,
                }
              : null
          )
      );

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  updateStatusStart = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const movementId = Number(req.params.id);
      const userId = req.userId;

      const movement = await this.movementRepository.findOne({
        where: { id: movementId },
        relations: ["product", "destination_branch", "driver", "driver.user"],
      });

      if (!movement) {
        throw new AppError("Movimentação não encontrada", 404);
      }

      if (movement.status !== MovementStatus.PENDING) {
        throw new AppError("Movimentação ja foi iniciada ou finalizada", 400);
      }

      const driver = await this.driverRepository.findOne({
        where: { user: { id: userId } },
        relations: ["user"],
      });

      if (!driver) {
        throw new AppError("Motorista não encontrado", 404);
      }

      movement.status = MovementStatus.IN_PROGRESS;
      movement.driver = driver;
      await this.movementRepository.save(movement);

      const movementResponse = new MovementResponseDTO(
        movement.id,
        movement.quantity,
        movement.status,
        movement.created_at,
        movement.updated_at,
        movement.product
          ? {
              id: movement.product.id,
              name: movement.product.name,
              description: movement.product.description,
            }
          : null,
        movement.destination_branch ? movement.destination_branch.id : null,
        movement.driver
          ? { id: movement.driver.id, name: movement.driver.user.name }
          : null
      );

      res
        .status(200)
        .json({
          message: `Movimentação iniciada com sucesso por ${driver.user.name} `,
          movement: movementResponse,
        });
    } catch (error) {
      next(error);
    }
  };

    updateStatusFinish = async ( req:Request, res: Response, next: NextFunction) => {
        try {
            const movementId = Number(req.params.id);
            const userId = req.userId;

            const movement = await this.movementRepository.findOne({
                where: { id: movementId},
                relations: ["product", "destination_branch", "driver", "driver.user"]
            })

            if(!movement) {
                throw new AppError("Movimentação não encontrada", 404)
            }

            if(movement.status === MovementStatus.PENDING) {
                throw new AppError("Movimentação não foi iniciada", 400)
            }

            if(movement.status === MovementStatus.FINISHED) {
                throw new AppError("Movimentação já foi finalizada", 400)
            }

            if(movement.driver.user.id !== userId) {
                throw new AppError("Você não tem permissão para finalizar essa movimentação", 403)
            }

            movement.status = MovementStatus.FINISHED
            await this.movementRepository.save(movement)

            const movementResponse = new MovementResponseDTO(
                movement.id,
                movement.quantity,
                movement.status,
                movement.created_at,
                movement.updated_at,
                movement.product ? {
                    id: movement.product.id,
                    name: movement.product.name,
                    description: movement.product.description
                } : null,
                movement.destination_branch ? movement.destination_branch.id : null,
                movement.driver ? { id: movement.driver.id, name: movement.driver.user.name } : null
            )

            res.status(200).json({ message: "Movimentação finalizada com sucesso", movement: movementResponse })

        } catch (error) {
            next(error)
        }
    }
}

export default MovementController;
