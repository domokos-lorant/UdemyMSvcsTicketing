import {
  OrderCancelledEvent,
  Publisher,
  Subjects
} from "@lorantd_study/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
