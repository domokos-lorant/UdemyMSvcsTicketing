import CustomError, { SerializedErrors } from "./custom-error";

const REASON = "Error connecting to the database";

export default class DatabaseConnectionError extends CustomError {
   reason = REASON;
   statusCode = 500;

   constructor() {
      super(REASON);
      Object.setPrototypeOf(this, new.target.prototype);
   }

   serializeErrors(): SerializedErrors {
      return [{ message: this.reason }];
   }
}
