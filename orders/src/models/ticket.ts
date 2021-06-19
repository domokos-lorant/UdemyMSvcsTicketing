import mongoose, { Query } from "mongoose";
import { Order, OrderStatus } from "./order";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface TicketAttributes {
  id: string;
  title: string;
  price: number;
}

export interface TicketDocument
  extends mongoose.Document,
    Omit<TicketAttributes, "id"> {
  isReserved(): Promise<boolean>;
  version: number;
}

interface TicketModel extends mongoose.Model<TicketDocument> {
  build(attributes: TicketAttributes): TicketDocument;
  findByEvent(event: {
    id: string;
    version: number;
  }): Query<TicketDocument | null, TicketDocument>;
}

const ticketSchema = new mongoose.Schema(
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

ticketSchema.set("versionKey", "version");
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.build = (attributes: TicketAttributes): TicketDocument => {
  const { id, ...rest } = attributes;
  return new Ticket({
    ...rest,
    _id: id
  });
};

ticketSchema.statics.findByEvent = (event: {
  id: string;
  version: number;
}): Query<TicketDocument | null, TicketDocument> => {
  return Ticket.findOne({ _id: event.id, version: event.version - 1 });
};

// We need to use a founction (not labda) to ensure "this" is the document.
ticketSchema.methods.isReserved = async function () {
  // Query orders where ticket is the one we want to reserve
  // and order is not cancelled. If we find such an order, then
  // the ticket is reserved.
  const existingOrder = await Order.findOne({
    ticket: this as any,
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
