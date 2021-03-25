import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

type UserPayload = {
   id: string;
   email: string;
};

// Extend Request type with currentUser that is added in this middleware.
declare global {
   // eslint-disable-next-line @typescript-eslint/no-namespace
   namespace Express {
      interface Request {
         currentUser?: UserPayload;
      }
   }
}

export const currentUser = (
   req: Request,
   _res: Response,
   next: NextFunction
): void => {
   const token = req.session?.jwt;

   if (!token) {
      return next();
   }

   try {
      const payload = jwt.verify(token, process.env.JWT_KEY!) as UserPayload;
      req.currentUser = payload;
   } catch (_error) {
      // Do nothing.
   }

   return next();
};
