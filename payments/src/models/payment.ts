import mongoose from "mongoose";

export interface PaymentAttributes {
  orderId: string;
  stripeId: string;
}

interface PaymentDocument
  extends mongoose.Document,
    Omit<PaymentAttributes, "id"> {}

interface PaymentModel extends mongoose.Model<PaymentDocument> {
  build(attributes: PaymentAttributes): PaymentDocument;
}

const PaymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true
    },
    stripeId: {
      type: String,
      required: true
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

PaymentSchema.statics.build = (attributes: PaymentAttributes) => {
  return new Payment(attributes);
};

const Payment = mongoose.model<PaymentDocument, PaymentModel>(
  "Payment",
  PaymentSchema
);

export { Payment };
