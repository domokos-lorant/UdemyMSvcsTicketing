import mongoose from "mongoose";
import { Order, OrderStatus } from "./order";

interface TicketAttributes {
  title: string;
  price: number;
}

export interface TicketDocument extends mongoose.Document, TicketAttributes {
  isReserved(): Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDocument> {
  build(attributes: TicketAttributes): TicketDocument;
}

const ticketSchema = new mongoose.Schema<TicketDocument>(
  {
    title: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
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

ticketSchema.statics.build = (attributes: TicketAttributes): TicketDocument => {
  return new Ticket(attributes);
};

// We need to use a founction (not labda) to ensure "this" is the document.
ticketSchema.methods.isReserved = async function () {
  // Query orders where ticket is the one we want to reserve
  // and order is not cancelled. If we find such an order, then
  // the ticket is reserved.
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete
      ]
    }
  });

  return !!existingOrder;
};

const Ticket = mongoose.model<TicketDocument, TicketModel>(
  "Ticket",
  ticketSchema
);

export { Ticket };
