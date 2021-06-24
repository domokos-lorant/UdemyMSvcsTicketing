import {
  Publisher,
  Subjects,
  PaymentCreatedEvent
} from "@lorantd_study/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
