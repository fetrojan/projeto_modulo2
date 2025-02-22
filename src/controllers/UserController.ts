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
}

export default UserController;
