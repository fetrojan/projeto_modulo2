import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { LoginDTO } from "../dtos/LoginDTO";
import bcrypt from "bcrypt"
import AppError from "../utils/AppError";
import jwt from "jsonwebtoken";

class AuthController {
    private userRepository

    constructor() {
        this.userRepository = AppDataSource.getRepository(User);
    }

    login = async (req: Request, res: Response, next: NextFunction) => {
        try{

            let userBody = req.body as LoginDTO
    
            const userEntity = await this.userRepository.findOneBy({ email: userBody.email })
    
            if(!userEntity) {
                throw new AppError("Usuário não encontrado", 404)
            }
    
            const passwordMatch = await bcrypt.compare(userBody.password, userEntity.password)
    
            if(!passwordMatch) {
                throw new AppError("Usuário e/ou senha inválido(s)", 401)
            }
    
            const payload = {
                userId: userEntity.id,
                email: userEntity.email,
                profile: userEntity.profile,
                name: userEntity.name
            }
    
            const token = jwt.sign(payload, process.env.JWT_SECRET ?? "", { expiresIn: "1d" })
    
            res.status(200).json({ token: token, user: payload.name, profile: payload.profile })
        } catch (error) {
            next(error)
        }
    }
}


export default AuthController;