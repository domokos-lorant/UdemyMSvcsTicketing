import {
  ExpirationCompleteEvent,
  Listener,
  OrderStatus,
  propertyOf,
  Subjects
} from "@lorantd_study/common";
import { Message } from "node-nats-streaming";
import { Order, OrderAttributes } from "../../models/order";
import { natsWrapper } from "../../nats-wrapper";
import { OrderCancelledPublisher } from "../order-cancelled-publisher";
import { queueGroupName } from "./queue-group-name";

// eslint-disable-next-line max-len
export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
  queueGroupName = queueGroupName;

  async onMessage(
    data: ExpirationCompleteEvent["data"],
    msg: Message
  ): Promise<void> {
    const order = await Order.findById(data.orderId).populate(
      propertyOf<OrderAttributes>("ticket")
    );

    if (!order) {
      throw new Error("Order not found!");
    }

    // Don't cancel complete orders.
    if (order.status === OrderStatus.Complete) {
      return msg.ack();
    }

    order.set({
      status: OrderStatus.Cancelled
    });
    await order.save();

    await new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      ticket: { id: order.ticket.id },
      version: order.version
    });

    msg.ack();
  }
}
