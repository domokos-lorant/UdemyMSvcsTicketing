import {
  ExpirationCompleteEvent,
  Publisher,
  Subjects
} from "@lorantd_study/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
