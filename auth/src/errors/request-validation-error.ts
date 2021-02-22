import { ValidationError } from "express-validator";
import CustomError, { SerializedErrors } from "./custom-error";

export default class RequestValidationError extends CustomError {
   statusCode = 400;

   constructor(public errors: ValidationError[]) {
      super("Invalid request parameters");
      Object.setPrototypeOf(this, new.target.prototype);
   }

   serializeErrors(): SerializedErrors {
      return this.errors.map((error) => {
         return { message: error.msg, field: error.param };
      });
   }
}
