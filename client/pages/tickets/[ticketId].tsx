import { AxiosInstance } from "axios";
import { NextPageContext } from "next";
import Router from "next/router";
import React from "react";
import useRequest from "../../hooks/use-request";
import { CurrentUser } from "../../types/CurrentUser";
import Order from "../../types/Order";
import Ticket from "../../types/Ticket";

type Props = { ticket: Ticket };

const TicketShow = ({ ticket }: Props) => {
  const { doRequest, errors } = useRequest<Order>({
    url: "/api/orders",
    method: "post",
    body: {
      ticketId: ticket.id,
    },
  });

  const handlePurchase = async () => {
    const { isSuccessfull, data: order } = await doRequest();

    if (isSuccessfull && order) {
      Router.push("/orders/[orderId]", `/orders/${order.id}`);
    }
  };

  return (
    <div>
      <h1>{ticket.title}</h1>
      <h4>{`Price: ${ticket.price}`}</h4>
      {errors}
      <button
        className="btn btn-primary"
        type="button"
        onClick={handlePurchase}
      >
        Purchase
      </button>
    </div>
  );
};

TicketShow.getInitialProps = async (
  context: NextPageContext,
  client: AxiosInstance,
  _currentUser: CurrentUser,
) => {
  const { ticketId } = context.query;
  const { data } = await client.get<Ticket>(`/api/tickets/${ticketId}`);

  return { ticket: data };
};

export default TicketShow;
