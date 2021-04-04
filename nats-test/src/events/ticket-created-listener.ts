import { Message } from "node-nats-streaming";
import { Listener } from "./base-listener";
import { Subjects } from "./subjects";
import { TickerCreatedEvent } from "./ticket-created-event";

export class TicketCreatedListener extends Listener<TickerCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  queueGroupName = "payments-service";

  onMessage(data: TickerCreatedEvent["data"], msg: Message) {
    console.log("Event data!", data);

    msg.ack();
  }
}