import express, { Request, Response } from "express";
import { requireAuth, validateRequest } from "@lorantd_study/common";
import Ticket from "../models/ticket";
import { validators } from "./validators";

const router = express.Router();

router.post(
  "/api/tickets",
  requireAuth,
  validators,
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;
    const newTicket = Ticket.build({
      title,
      price,
      userId: req.currentUser!.id
    });
    await newTicket.save();
    res.status(201).send(newTicket);
  }
);

export { router as createTicketRouter };
