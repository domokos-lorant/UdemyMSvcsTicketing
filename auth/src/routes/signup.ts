import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import BadRequestError from "../errors/bad-request-error";
import RequestValidationError from "../errors/request-validation-error";
import User from "../models.ts/user";

const signupRouter = express.Router();
const signupValidators = [
   body("email").isEmail().withMessage("Email must be valid"),
   body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters")
];

signupRouter.post(
   "/api/users/signup",
   signupValidators,
   async (req: Request, res: Response) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
         throw new RequestValidationError(errors.array());
      }

      const { email, password } = req.body;

      const existingUser = await User.findOne({ email });

      if (existingUser) {
         throw new BadRequestError("Email in use");
      }

      const user = await User.build({ email, password }).save();

      res.status(201).send(user);
   }
);

export default signupRouter;
