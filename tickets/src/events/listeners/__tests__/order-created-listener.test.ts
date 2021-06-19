import { OrderCreatedEvent, OrderStatus } from "@lorantd_study/common";
import { natsWrapper } from "../../../nats-wrapper";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { OrderCreatedListener } from "../order-created-listener";
import Ticket from "../../../models/ticket";

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);
  const ticket = Ticket.build({
    title: "concert",
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString()
  });
  await ticket.save();
  const event: OrderCreatedEvent["data"] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    expiresAt: "test",
    ticket: {
      id: ticket.id,
      price: ticket.price
    }
  };
  const msg: Message = ({ ack: jest.fn() } as unknown) as Message;

  return {
    listener,
    event,
    msg
  };
};

it("sets the orderId of the ticket to mark it reserved", async () => {
  // Arrange.
  const { event, listener, msg } = await setup();

  // Act.
  await listener.onMessage(event, msg);

  // Assert.
  const ticket = await Ticket.findById(event.ticket.id);
  expect(ticket!.orderId).toEqual(event.id);
});

it("acks the message", async () => {
  // Arrange.
  const { event, listener, msg } = await setup();

  // Act.
  await listener.onMessage(event, msg);

  // Assert.
  expect(msg.ack).toHaveBeenCalled();
});

it("publishes a TicketUpdatedEvent", async () => {
  // Arrange.
  const { event, listener, msg } = await setup();

  // Act.
  await listener.onMessage(event, msg);

  // Assert.
  expect(natsWrapper.client.publish).toHaveBeenCalledWith(
    "ticket:updated",
    expect.stringContaining(event.id),
    expect.anything()
  );
});
