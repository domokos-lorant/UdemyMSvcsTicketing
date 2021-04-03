import express, { Request, Response } from "express";
import { body } from "express-validator";
import { BadRequestError, validateRequest } from "@lorantd_study/common";
import User from "../models.ts/user";
import jwt from "jsonwebtoken";

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
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new BadRequestError("Email in use");
    }

    const user = await User.build({ email, password }).save();

    // Generate JWT
    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      process.env.JWT_KEY!
    );

    // Store JWT on session
    req.session = { jwt: userJwt };

    res.status(201).send(user);
  }
);

export default signupRouter;
