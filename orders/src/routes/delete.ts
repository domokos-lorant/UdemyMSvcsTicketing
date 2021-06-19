import {
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
  propertyOf,
  requireAuth,
  validateRequest
} from "@lorantd_study/common";
import express, { Request, Response } from "express";
import { param } from "express-validator";
import mongoose from "mongoose";
import { OrderCancelledPublisher } from "../events/order-cancelled-publisher";
import { Order, OrderAttributes } from "../models/order";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

const validators = [
  param("orderId")
    .not()
    .isEmpty()
    .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
    .withMessage("OrderId must not empty.")
];

router.delete(
  "/api/orders/:orderId",
  requireAuth,
  validators,
  validateRequest,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate(
      propertyOf<OrderAttributes>("ticket")
    );

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    // Publish an order cancelled event.
    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id
      }
    });

    res.status(204).send(order);
  }
);

export { router as deleteOrderRouter };
