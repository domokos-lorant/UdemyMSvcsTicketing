import {
  requireAuth,
  validateRequest,
  propertyOf,
  NotFoundError,
  NotAuthorizedError
} from "@lorantd_study/common";
import express, { Request, Response } from "express";
import { Order } from "../models/order";
import type { OrderAttributes } from "../models/order";
import { param } from "express-validator";
import mongoose from "mongoose";

const router = express.Router();

const validators = [
  param("orderId")
    .not()
    .isEmpty()
    .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
    .withMessage("OrderId must not empty.")
];

router.get(
  "/api/orders/:orderId",
  requireAuth,
  validators,
  validateRequest,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate(
      propertyOf<OrderAttributes>("ticket")
    );

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    res.send(order);
  }
);

export { router as showOrderRouter };
