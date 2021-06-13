import mongoose from "mongoose";
import { OrderStatus } from "@lorantd_study/common";
import { TicketDocument } from "./ticket";

export { OrderStatus };

export interface OrderAttributes {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDocument;
}

interface OrderDocument extends mongoose.Document, OrderAttributes {}

interface OrderModel extends mongoose.Model<OrderDocument> {
  build(attributes: OrderAttributes): OrderDocument;
}

const orderSchema = new mongoose.Schema<OrderDocument>(
  {
    userId: {
      type: String,
      required: true
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created
    },
    expiresAt: {
      type: mongoose.Schema.Types.Date
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket"
    }
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      }
    }
  }
);

orderSchema.statics.build = (attributes: OrderAttributes) => {
  return new Order(attributes);
};

const Order = mongoose.model<OrderDocument, OrderModel>("Order", orderSchema);

export { Order };
