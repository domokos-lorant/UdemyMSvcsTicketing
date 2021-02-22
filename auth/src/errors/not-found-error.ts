import CustomError, { SerializedErrors } from "./custom-error";

export default class NotFoundError extends CustomError {
   statusCode = 404;

   constructor() {
      super("Route not found");
      Object.setPrototypeOf(this, new.target.prototype);
   }

   serializeErrors(): SerializedErrors {
      return [{ message: "Not found" }];
   }
}
