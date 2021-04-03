import mongoose, { Document, Schema, Model } from "mongoose";

export interface TicketAttributes {
  title: string;
  userId: string;
  price: number;
}

export interface TicketDocument extends TicketAttributes, Document {}

interface TicketModel extends Model<TicketDocument> {
  build(attributes: TicketAttributes): TicketDocument;
}

const TicketSchema = new Schema<TicketDocument>(
  {
    title: {
      type: String,
      required: true
    },
    userId: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  },
  {
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      }
    }
  }
);

TicketSchema.statics.build = (attributes: TicketAttributes): TicketDocument => {
  return new Ticket(attributes);
};

const Ticket = mongoose.model<TicketDocument, TicketModel>(
  "Ticket",
  TicketSchema
);

export default Ticket;
