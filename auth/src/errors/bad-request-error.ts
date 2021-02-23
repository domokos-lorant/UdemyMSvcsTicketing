import CustomError, { SerializedErrors } from "./custom-error";

export default class BadRequestError extends CustomError {
   statusCode = 400;

   constructor(public message: string) {
      super(message);
      Object.setPrototypeOf(this, new.target.prototype);
   }

   serializeErrors(): SerializedErrors {
      return [{ message: this.message }];
   }
}
