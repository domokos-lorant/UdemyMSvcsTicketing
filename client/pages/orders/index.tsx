import { AxiosInstance } from "axios";
import { NextPageContext } from "next";
import React from "react";
import { CurrentUser } from "../../types/CurrentUser";
import Order from "../../types/Order";

type Props = { orders: Order[] };

const OrderIndex = ({ orders }: Props) => {
  return (
    <ul>
      {orders.map((order) => (
        <li key={order.id}>{`${order.ticket.title} - ${order.status}`}</li>
      ))}
    </ul>
  );
};

OrderIndex.getInitialProps = async (
  _context: NextPageContext,
  client: AxiosInstance,
  _currentUser: CurrentUser,
) => {
  const { data } = await client.get<Order[]>("/api/orders");

  return { orders: data };
};

export default OrderIndex;
