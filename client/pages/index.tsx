import { AxiosInstance } from "axios";
import { NextPageContext } from "next";
import React from "react";
import Link from "next/link";
import type { CurrentUser } from "../types/CurrentUser";
import Ticket from "../types/Ticket";

type Props = CurrentUser & { tickets: Ticket[] };

export default function Index({ tickets }: Props) {
  const ticketList = tickets.map((ticket) => {
    return (
      <tr key={ticket.id}>
        <td>{ticket.title}</td>
        <td>{ticket.price}</td>
        <td>
          <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
            <a>View</a>
          </Link>
        </td>
      </tr>
    );
  });

  return (
    <div>
      <h1>Tickets</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>{ticketList}</tbody>
      </table>
    </div>
  );
}

Index.getInitialProps = async (
  _context: NextPageContext,
  client: AxiosInstance,
  _currentUser: CurrentUser,
) => {
  const { data } = await client.get<Ticket[]>("/api/tickets");
  return { tickets: data };
};
