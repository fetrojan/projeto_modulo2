import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User, UserProfile } from "../entities/User";
import { Driver } from "../entities/Driver";
import { Branch } from "../entities/Branch";
import { CreateUserDTO } from "../dtos/CreateUserDTO";
import AppError from "../utils/AppError";

import bcrypt from "bcrypt";
import { validate as validateCPF } from "cpf-check";
import { cnpj as validateCNPJ } from "cpf-cnpj-validator";
import { UserResponseDTO } from "../dtos/UserReponseDTO";

class UserController {
  private userRepository;
  private driverRepository;
  private branchRepository;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.driverRepository = AppDataSource.getRepository(Driver);
    this.branchRepository = AppDataSource.getRepository(Branch);
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userBody = req.body as CreateUserDTO;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !userBody.name ||
        !userBody.email ||
        !userBody.password ||
        !userBody.profile
      ) {
        throw new AppError(
          "Os campos name, email, password e profile são obrigatórios",
          400
        );
      } else if (!Object.values(UserProfile).includes(userBody.profile)) {
        throw new AppError("Este profile não existe", 400);
      } else if (!emailRegex.test(userBody.email)) {
        throw new AppError("O email informado é inválido", 400);
      } else if (
        userBody.password.length < 6 ||
        userBody.password.length > 20
      ) {
        throw new AppError("A senha deve ter entre 6 e 20 caracteres", 400);
      } else if (
        (userBody.profile === UserProfile.DRIVER ||
          userBody.profile === UserProfile.BRANCH) &&
        !userBody.document
      ) {
        throw new AppError(
          "O campo document é obrigatório para DRIVER e BRANCH",
          400
        );
      } else if (
        userBody.profile === UserProfile.DRIVER &&
        !validateCPF(userBody.document)
      ) {
        throw new AppError("CPF inválido", 400);
      } else if (
        userBody.profile === UserProfile.BRANCH &&
        !validateCNPJ.isValid(userBody.document)
      ) {
        throw new AppError("CNPJ inválido", 400);
      }

      const existingDocument = await this.driverRepository.findOne({
        where: { document: userBody.document },
      });

      if (existingDocument) {
        throw new AppError("Este documento já está cadastrado", 409);
      }

      const existingUser = await this.userRepository.findOne({
        where: { email: userBody.email },
      });

      if (existingUser) {
        throw new AppError("Este e-mail já está cadastrado", 409);
      }

      const passwordHash = await bcrypt.hash(userBody.password, 10);

      let user = await this.userRepository.save({
        name: userBody.name,
        password: passwordHash,
        email: userBody.email,
        profile: userBody.profile,
      });

      if (user.profile === UserProfile.DRIVER) {
        await this.driverRepository.save({
          user,
          full_address: userBody.full_address,
          document: userBody.document,
        });
      } else if (user.profile === UserProfile.BRANCH) {
        await this.branchRepository.save({
          user,
          full_address: userBody.full_address,
          document: userBody.document,
        });
      }

      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let profile = req.query.profile as UserProfile;

      if (!!profile && !Object.values(UserProfile).includes(profile)) {
        throw new AppError("Valor inválido para a query", 400);
      }

      let users = [] as User[];

      if (!!profile) {
        users = await this.userRepository.find({
          where: { profile: profile },
          select: ["id", "name", "status", "profile"],
        });
      } else {
        users = await this.userRepository.find({
          select: ["id", "name", "status", "profile"],
        });
      }
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id;
      const requestingUser = req.profile;

      const user = await this.userRepository.findOne({
        where: { id: Number(userId) },
        relations: ["driver", "branch"],
      });

      if (!user) {
        throw new AppError("Usuário não encontrado", 404);
      }
      const userResponse = new UserResponseDTO(user)

      if (
        requestingUser === UserProfile.ADMIN ||
        (requestingUser === UserProfile.DRIVER && req.userId === Number(userId))
      ) {
        res.status(200).json(userResponse);
        return;
      }

      throw new AppError(
        "Você não tem permissão para acessar este recurso",
        401
      );
    } catch (error) {
      next(error);
    }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = Number(req.params.id)
      const requestingUser = req.profile
      const userLoggedId = req.userId

      const user = await this.userRepository.findOne({
        where: { id: Number(userId)},
        relations: ["driver"]
      })

      if (!user) {
        throw new AppError("Usuário não encontrado", 404)
      }

      const isAdmin = requestingUser === UserProfile.ADMIN
      const isDriverUpdatingOwnProfile = requestingUser === UserProfile.DRIVER && userLoggedId === userId

      if(!isAdmin && !isDriverUpdatingOwnProfile) {
        throw new AppError("Você não tem permissão para acessar este recurso", 401)
      }

      const forbiddenFields = ["id", "created_at", "profile", "updated_at", "status"]

      const foundFields = forbiddenFields.filter(field => field in req.body)

      if(foundFields.length > 0) {
        throw new AppError(`Os campos ${foundFields.join(", ")} não podem ser atualizados`, 400)
      }

      const { name, email, password, full_address } = req.body

      if(name) user.name = name
      if(email) {
        const existingUser = await this.userRepository.findOne({ where: { email }})
        if(existingUser) {
          throw new AppError("Este e-mail já está cadastrado", 409)
        }
        user.email = email
      }
      if(password) {
        const hashedPassword = await bcrypt.hash(password, 10)
        user.password = hashedPassword
      }

      await this.userRepository.save(user)

      if(full_address && user.profile === UserProfile.DRIVER) {
        user.driver.full_address = full_address
        await this.driverRepository.save(user.driver)
      }

      res.status(200).json(user)

    } catch (error) {
      next(error);
    }
  }

  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = Number(req.params.id)

      const user = await this.userRepository.findOne({
        where: { id: userId }
      })

      if(!user) {
        throw new AppError("Usuário não encontrado", 404)
      }

      user.status = !user.status

      await this.userRepository.save(user)

      res.status(200).json({ message: "Status atualizado com sucesso" })
    } catch (error) {
      next(error)
    }
  }
}

export default UserController;
