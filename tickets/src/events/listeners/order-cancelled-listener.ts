import { Listener, OrderCancelledEvent, Subjects } from "@lorantd_study/common";
import { Message } from "node-nats-streaming";
import Ticket from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
import { queueGroupName } from "./queue-group-name";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(
    data: OrderCancelledEvent["data"],
    msg: Message
  ): Promise<void> {
    // Find the ticket we are cancelling order for.
    const ticket = await Ticket.findById(data.ticket.id);

    // If not found, throw.
    if (!ticket) {
      throw new Error("Ticket not found");
    }

    // Mark ticket as un-reserved and save.
    ticket.set({ orderId: undefined });
    await ticket.save();

    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
      version: ticket.version,
      orderId: ticket.orderId
    });

    // Ack message.
    msg.ack();
  }
}
