import {
  Listener,
  Subjects,
  PaymentCreatedEvent,
  OrderStatus
} from "@lorantd_study/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { queueGroupName } from "./queue-group-name";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(
    data: PaymentCreatedEvent["data"],
    msg: Message
  ): Promise<void> {
    const { orderId } = data;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new Error("Order not found!");
    }

    order.set({ status: OrderStatus.Complete });
    await order.save();

    // TODO: technically we should now publish an event
    // so that other microservices are made aware of
    // new order version.

    msg.ack();
  }
}
