import { ExpirationCompleteEvent, OrderStatus } from "@lorantd_study/common";
import mongoose from "mongoose";
import { natsWrapper } from "../../../nats-wrapper";
import { ExpirationCompleteListener } from "../expiration-complete-listener";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { Order } from "../../../models/order";

const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client);
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 10
  });
  await ticket.save();
  const order = Order.build({
    userId: "testUserId",
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket
  });
  await order.save();
  const event: ExpirationCompleteEvent["data"] = {
    orderId: order.id
  };
  const msg: Message = ({ ack: jest.fn() } as unknown) as Message;

  return {
    listener,
    event,
    msg,
    order,
    ticket
  };
};

const arrangeAndAct = async () => {
  // Arrange.
  const { event, listener, msg } = await setup();

  // Act.
  await listener.onMessage(event, msg);

  return { event, listener, msg };
};

it("updates order status to cancelled", async () => {
  const { event } = await arrangeAndAct();

  // Assert.
  const updatedOrder = await Order.findById(event.orderId);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("publishes an OrderCancelledEvent", async () => {
  const { event } = await arrangeAndAct();

  // Assert.
  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1);
  expect(natsWrapper.client.publish).toHaveBeenCalledWith(
    "order:cancelled",
    expect.stringContaining(event.orderId),
    expect.anything()
  );
});

it("acks the message", async () => {
  const { msg } = await arrangeAndAct();

  // Assert.
  expect(msg.ack).toHaveBeenCalled();
});
