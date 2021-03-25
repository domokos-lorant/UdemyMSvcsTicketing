import CustomError, { SerializedErrors } from "./custom-error";

const ERROR_MESSSAGE = "Not authorized";

export class NotAuthorizedError extends CustomError {
   statusCode = 401;

   constructor() {
      super(ERROR_MESSSAGE);
      Object.setPrototypeOf(this, new.target.prototype);
   }

   serializeErrors(): SerializedErrors {
      return [{ message: ERROR_MESSSAGE }];
   }
}
