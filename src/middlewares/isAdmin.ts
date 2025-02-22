import { Request, Response, NextFunction } from "express";
import { UserProfile } from "../entities/User";
import AppError from "../utils/AppError";

export const isAdmin = (req:Request, res:Response, next:NextFunction) => {
    const profile = req.profile
   
    if(!profile) {
        throw new AppError("Usuário não encontrado", 404)
    }

    if(profile !== String(UserProfile.ADMIN)) {
        throw new AppError("Usuário não é um administrador para ter acesso a esta rota", 401)
    }

    next()
}