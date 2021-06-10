import { Publisher, Subjects, TicketCreatedEvent } from "@lorantd_study/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
