import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import mongoose from "mongoose";

const buildTicket = async () => {
  const ticketId = mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    id: ticketId,
    title: "Concert",
    price: 20
  });
  await ticket.save();

  return ticket;
};

it("fetches orders for user", async () => {
  // Create 3 tickets.
  const ticket1 = await buildTicket();
  const ticket3 = await buildTicket();
  const ticket2 = await buildTicket();

  const user1 = global.signin("userId1");
  const user2 = global.signin("userId2");

  // Create one order as User #1.
  await request(app)
    .post("/api/orders")
    .set("Cookie", user1)
    .send({ ticketId: ticket1.id })
    .expect(201);

  // Create two orders as User #2.
  const { body: expectedOrder1 } = await request(app)
    .post("/api/orders")
    .set("Cookie", user2)
    .send({ ticketId: ticket2.id })
    .expect(201);
  const { body: expectedOrder2 } = await request(app)
    .post("/api/orders")
    .set("Cookie", user2)
    .send({ ticketId: ticket3.id })
    .expect(201);

  // Get orders for User #2.
  const response = await request(app)
    .get("/api/orders/")
    .set("Cookie", user2)
    .expect(200);

  // Expect to get only orders for User #2.
  expect(response.body.length).toEqual(2);
  expect(response.body[0].id).toEqual(expectedOrder1.id);
  expect(response.body[1].id).toEqual(expectedOrder2.id);
  expect(response.body[0].ticket.id).toEqual(ticket2.id);
  expect(response.body[1].ticket.id).toEqual(ticket3.id);
});
