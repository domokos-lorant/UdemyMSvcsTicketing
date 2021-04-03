import express, { Request, Response } from "express";
import { requireAuth, validateRequest } from "@lorantd_study/common";
import { body } from "express-validator";
import Ticket from "../models/ticket";

const router = express.Router();
const validators = [
  body("title").not().isEmpty().withMessage("Title is required"),
  body("price").isFloat({ gt: 0 }).withMessage("Price must be greater than 0")
];

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
