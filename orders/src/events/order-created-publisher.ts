import { OrderCreatedEvent, Publisher, Subjects } from "@lorantd_study/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
