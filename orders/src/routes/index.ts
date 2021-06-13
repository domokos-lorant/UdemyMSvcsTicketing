import { propertyOf, requireAuth } from "@lorantd_study/common";
import express, { Request, Response } from "express";
import { Order } from "../models/order";
import type { OrderAttributes } from "../models/order";

const router = express.Router();

router.get("/api/orders", requireAuth, async (req: Request, res: Response) => {
  const orders = await Order.find({ userId: req.currentUser!.id }).populate(
    propertyOf<OrderAttributes>("ticket")
  );

  res.status(200).send(orders);
});

export { router as indexOrderRouter };
