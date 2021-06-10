import express, { Request, Response } from "express";
import { requireAuth, validateRequest } from "@lorantd_study/common";
import Ticket from "../models/ticket";
import { validators } from "./validators";
// eslint-disable-next-line max-len
import { TicketCreatedPublisher } from "../events/publishers/ticket-created-publisher";
import { natsWrapper } from "../nats-wrapper";

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
    // TODO: implement transactional outbox.
    await newTicket.save();
    await new TicketCreatedPublisher(natsWrapper.client).publish({
      id: newTicket.id,
      title: newTicket.title,
      price: newTicket.price,
      userId: newTicket.userId
    });
    res.status(201).send(newTicket);
  }
);

export { router as createTicketRouter };
