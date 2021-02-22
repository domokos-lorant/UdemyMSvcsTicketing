import { NextFunction, Request, Response } from "express";
import CustomError from "../errors/custom-error";

export const errorHandler = (
   error: Error,
   _req: Request,
   res: Response,
   _next: NextFunction
): Response => {
   if (error instanceof CustomError) {
      return res
         .status(error.statusCode)
         .send({ errors: error.serializeErrors() });
   }

   return res
      .status(400)
      .send({ error: [{ message: "Something went wrong" }] });
};
