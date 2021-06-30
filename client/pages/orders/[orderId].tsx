import { AxiosInstance } from "axios";
import { NextPageContext } from "next";
import Router from "next/router";
import React, { useEffect, useState } from "react";
import StripeCheckout from "react-stripe-checkout";
import useRequest from "../../hooks/use-request";
import { CurrentUser } from "../../types/CurrentUser";
import Order from "../../types/Order";

type Props = { order: Order } & CurrentUser;

const OrderShow = ({ order, currentUser }: Props) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const { doRequest, errors } = useRequest({
    url: "/api/payments",
    method: "post",
    body: {
      orderId: order.id,
    },
  });
  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt).getTime() - new Date().getTime();
      setTimeLeft(Math.round(msLeft / 1000));
    };
    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, [order]);

  if (timeLeft < 0) {
    return <div>Order expired</div>;
  }

  return (
    <div>
      {`Time left to pay: ${timeLeft} seconds `}
      <StripeCheckout
        token={async ({ id }) => {
          const { isSuccessfull } = await doRequest({ token: id });

          if (isSuccessfull) {
            Router.push("/orders");
          }
        }}
        stripeKey="pk_test_51IGI2qFyo3OAQn0T4H84bdMPaO7HviLurFV9OWXYs9Yfc73WdHpzGDtrHqQ0MEgoy3u22Ph9VC2lLMu3qjoJUq3B00JxbTBmnC"
        amount={order.ticket.price * 100}
        email={currentUser?.email}
      />
      {errors}
    </div>
  );
};

OrderShow.getInitialProps = async (
  context: NextPageContext,
  client: AxiosInstance,
  _currentUser: CurrentUser,
) => {
  const { orderId } = context.query;
  const { data } = await client.get<Order>(`/api/orders/${orderId}`);

  return { order: data };
};

export default OrderShow;
