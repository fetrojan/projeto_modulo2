import { Request, Response, NextFunction } from "express";
import { UserProfile } from "../entities/User";
import AppError from "../utils/AppError";

export const isBranch = (req:Request, res:Response, next:NextFunction) => {
    const profile = req.profile
   
    if(!profile) {
        throw new AppError("Usuário não encontrado", 404)
    }

    if(profile !== String(UserProfile.DRIVER)) {
        throw new AppError("Somente usuários do tipo DRIVER podem utilizar este recurso", 401)
    }

    next()
}