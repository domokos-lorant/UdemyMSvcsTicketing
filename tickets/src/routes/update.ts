import express, { Request, Response } from "express";
import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
  validateRequest
} from "@lorantd_study/common";
import Ticket from "../models/ticket";
import { validators } from "./validators";

const router = express.Router();

router.put(
  "/api/tickets/:id",
  requireAuth,
  validators,
  validateRequest,
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      throw new NotFoundError();
    }

    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    const { title, price } = req.body;
    ticket.set({
      title,
      price
    });
    await ticket.save();

    res.send(ticket);
  }
);

export { router as updateTicketRouter };
