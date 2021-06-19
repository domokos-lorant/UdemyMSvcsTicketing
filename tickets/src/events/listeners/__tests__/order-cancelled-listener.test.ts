import { OrderCancelledEvent, OrderStatus } from "@lorantd_study/common";
import { natsWrapper } from "../../../nats-wrapper";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import Ticket from "../../../models/ticket";
import { OrderCancelledListener } from "../order-cancelled-listener";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);
  const orderId = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    title: "concert",
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString()
  });
  ticket.orderId = orderId;
  await ticket.save();
  const event: OrderCancelledEvent["data"] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    ticket: {
      id: ticket.id
    }
  };
  const msg: Message = ({ ack: jest.fn() } as unknown) as Message;

  return {
    listener,
    event,
    msg
  };
};

// eslint-disable-next-line max-len
it("sets the orderId of the ticket to undefined to mark it un-reserved", async () => {
  // Arrange.
  const { event, listener, msg } = await setup();

  // Act.
  await listener.onMessage(event, msg);

  // Assert.
  const ticket = await Ticket.findById(event.ticket.id);
  expect(ticket!.orderId).toBeUndefined();
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
    expect.not.stringContaining(event.id),
    expect.anything()
  );
});
