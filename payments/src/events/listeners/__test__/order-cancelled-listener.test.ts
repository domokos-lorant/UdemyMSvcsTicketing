import { OrderCancelledEvent, OrderStatus } from "@lorantd_study/common";
import { natsWrapper } from "../../../nats-wrapper";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { Order } from "../../../models/order";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);
  const orderId = new mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    id: orderId,
    price: 10,
    status: OrderStatus.Created,
    userId: "testId",
    version: 0
  });
  await order.save();
  const event: OrderCancelledEvent["data"] = {
    version: 1,
    id: orderId,
    ticket: {
      id: "testId"
    }
  };
  const msg: Message = { ack: jest.fn() } as unknown as Message;

  return {
    listener,
    event,
    msg
  };
};

it("set the order status to cancelled", async () => {
  // Arrange.
  const { event, listener, msg } = await setup();

  // Act.
  await listener.onMessage(event, msg);

  // Assert.
  const order = await Order.findById(event.id);
  expect(order!.status).toEqual(OrderStatus.Cancelled);
});

it("acks the message", async () => {
  // Arrange.
  const { event, listener, msg } = await setup();

  // Act.
  await listener.onMessage(event, msg);

  // Assert.
  expect(msg.ack).toHaveBeenCalled();
});
