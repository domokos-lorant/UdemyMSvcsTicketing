import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";
import { Order, OrderStatus } from "../../models/order";
import { stripe } from "../../stripe";
import { Payment } from "../../models/payment";
import { natsWrapper } from "../../nats-wrapper";

jest.mock("../../stripe");

it("returns a 404 when paying for non-existing order", async () => {
  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin())
    .send({
      token: "testToken",
      orderId: new mongoose.Types.ObjectId().toHexString()
    })
    .expect(404);
});

it("returns a 401 when paying for a not owned order", async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 20,
    status: OrderStatus.Created
  });
  await order.save();
  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin())
    .send({
      token: "testToken",
      orderId: order.id
    })
    .expect(401);
});

it("returns a 400 when paying for a cancelled order", async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 20,
    status: OrderStatus.Cancelled
  });
  await order.save();
  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(order.userId))
    .send({
      token: "testToken",
      orderId: order.id
    })
    .expect(400);
});

it("returns a 201 with valid inputs", async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 20,
    status: OrderStatus.Created
  });
  await order.save();
  const token = "tok_visa";
  const stripeId = "testStripeId";
  stripe.charges.create = jest.fn().mockResolvedValue({ id: stripeId });

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(order.userId))
    .send({
      token,
      orderId: order.id
    })
    .expect(201);

  expect(stripe.charges.create).toHaveBeenCalledWith({
    currency: "usd",
    amount: order.price * 100,
    source: token
  });
});

it("creates a payment in the DB", async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 20,
    status: OrderStatus.Created
  });
  await order.save();
  const token = "tok_visa";
  const stripeId = "testStripeId";
  stripe.charges.create = jest.fn().mockResolvedValue({ id: stripeId });

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(order.userId))
    .send({
      token,
      orderId: order.id
    })
    .expect(201);

  const payment = await Payment.findOne({ orderId: order.id, stripeId });
  expect(payment).not.toBeNull();
});

it("emits a payment created event", async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 20,
    status: OrderStatus.Created
  });
  await order.save();
  const token = "tok_visa";
  const stripeId = "testStripeId";
  stripe.charges.create = jest.fn().mockResolvedValue({ id: stripeId });

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(order.userId))
    .send({
      token,
      orderId: order.id
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
