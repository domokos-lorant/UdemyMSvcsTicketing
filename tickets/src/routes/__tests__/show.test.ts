import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import Ticket from "../../models/ticket";

it("returns a 404 if the ticket is not found", async () => {
  const cookie = global.signin();
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .get(`/api/tickets/${id}`)
    .set("Cookie", cookie)
    .send()
    .expect(404);
});

it("returns the ticket if it is found", async () => {
  // Add a ticket to find.
  const existingTicket = await Ticket.build({
    title: "TestTicket",
    price: 20,
    userId: "TestUserId"
  }).save();

  // Issue request.
  const cookie = global.signin();
  const response = await request(app)
    .get(`/api/tickets/${existingTicket.id}`)
    .set("Cookie", cookie)
    .send()
    .expect(200);

  expect(response.body.price).toEqual(existingTicket.price);
  expect(response.body.title).toEqual(existingTicket.title);
});
