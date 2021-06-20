import { OrderCreatedEvent, OrderStatus } from "@lorantd_study/common";
import { natsWrapper } from "../../../nats-wrapper";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { OrderCreatedListener } from "../order-created-listener";
import { Order } from "../../../models/order";

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);
  const event: OrderCreatedEvent["data"] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    expiresAt: "test",
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString(),
      price: 10
    }
  };
  const msg: Message = { ack: jest.fn() } as unknown as Message;

  return {
    listener,
    event,
    msg
  };
};

it("replicates the order info", async () => {
  // Arrange.
  const { event, listener, msg } = await setup();

  // Act.
  await listener.onMessage(event, msg);

  // Assert.
  const order = await Order.findById(event.id);
  expect(order!.price).toEqual(event.ticket.price);
});

it("acks the message", async () => {
  // Arrange.
  const { event, listener, msg } = await setup();

  // Act.
  await listener.onMessage(event, msg);

  // Assert.
  expect(msg.ack).toHaveBeenCalled();
});
