import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest
} from "@lorantd_study/common";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import mongoose from "mongoose";
import { Order } from "../models/order";
import { Ticket } from "../models/ticket";

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 15 * 60;

const validators = [
  body("ticketId")
    .not()
    .isEmpty()
    .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
    .withMessage("TicketId must not empty.")
];

router.post(
  "/api/orders",
  requireAuth,
  validators,
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;

    // Find the ticket the user is trying to order in the DB.
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      throw new NotFoundError();
    }

    // Make sure ticket is not reserved.
    const isReserved = await ticket.isReserved();

    if (isReserved) {
      throw new BadRequestError("Ticket is already reserved");
    }

    // Determine order expiration date.
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // Build and save order to DB.
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt,
      ticket
    });
    await order.save();

    // Publish order created event.

    res.status(201).send(order);
  }
);

export { router as newOrderRouter };
