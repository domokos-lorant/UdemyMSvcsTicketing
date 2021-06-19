import { TicketUpdatedEvent } from "@lorantd_study/common";
import { natsWrapper } from "../../../nats-wrapper";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { TicketUpdatedListener } from "../ticket-updated-listener";

const setup = async () => {
  const listener = new TicketUpdatedListener(natsWrapper.client);
  const ticketId = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    id: ticketId,
    title: "concert",
    price: 10
  });
  await ticket.save();
  const event: TicketUpdatedEvent["data"] = {
    version: ticket.version + 1,
    id: ticket.id,
    title: "concert",
    price: 20,
    userId: new mongoose.Types.ObjectId().toHexString()
  };
  const msg: Message = ({ ack: jest.fn() } as unknown) as Message;

  return {
    listener,
    event,
    msg,
    ticket
  };
};

it("finds, updates and saves a ticket", async () => {
  // Arrange.
  const { event, listener, msg } = await setup();

  // Act.
  await listener.onMessage(event, msg);

  // Assert.
  const updatedTicket = await Ticket.findById(event.id);
  expect(updatedTicket).toBeDefined();
  expect(updatedTicket!.title).toEqual(event.title);
  expect(updatedTicket!.price).toEqual(event.price);
  expect(updatedTicket!.version).toEqual(event.version);
});

it("acks the message", async () => {
  // Arrange.
  const { event, listener, msg } = await setup();

  // Act.
  await listener.onMessage(event, msg);

  // Assert.
  expect(msg.ack).toHaveBeenCalled();
});

it("does not call ack if we skipped a version", async () => {
  // Arrange.
  const { event, listener, msg } = await setup();
  event.version++;

  // Act and assert.
  await expect(listener.onMessage(event, msg)).rejects.toThrow();
  expect(msg.ack).not.toHaveBeenCalled();
});
