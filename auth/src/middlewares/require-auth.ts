import { NextFunction, Request, Response } from "express";
import { NotAuthorizedError } from "../errors/not-authorized_error";

export const requireAuth = (
   req: Request,
   res: Response,
   next: NextFunction
): void => {
   if (!req.currentUser) {
      throw new NotAuthorizedError();
   }

   return next();
};
