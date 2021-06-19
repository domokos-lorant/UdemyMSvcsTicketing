import { TicketCreatedEvent } from "@lorantd_study/common";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketCreatedListener } from "../ticket-created-listener";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
  const listener = new TicketCreatedListener(natsWrapper.client);
  const event: TicketCreatedEvent["data"] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString()
  };
  const msg: Message = ({ ack: jest.fn() } as unknown) as Message;

  return {
    listener,
    event,
    msg
  };
};

it("crates and saves a ticket", async () => {
  // Arrange.
  const { event, listener, msg } = await setup();

  // Act.
  await listener.onMessage(event, msg);

  // Assert.
  const ticket = await Ticket.findById(event.id);
  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(event.title);
  expect(ticket!.price).toEqual(event.price);
});

it("acks the message", async () => {
  // Arrange.
  const { event, listener, msg } = await setup();

  // Act.
  await listener.onMessage(event, msg);

  // Assert.
  expect(msg.ack).toHaveBeenCalled();
});
