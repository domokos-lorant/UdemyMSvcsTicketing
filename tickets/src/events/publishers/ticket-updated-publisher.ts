import { Publisher, Subjects, TicketUpdatedEvent } from "@lorantd_study/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TichetUpdated;
}
