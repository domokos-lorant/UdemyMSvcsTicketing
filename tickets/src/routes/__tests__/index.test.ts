import request from "supertest";
import { app } from "../../app";
import Ticket from "../../models/ticket";

it("can fetch a list of tickets", async () => {
  // Add some tickets.
  await Ticket.build({
    title: "TestTicket",
    price: 20,
    userId: "TestUserId"
  }).save();
  await Ticket.build({
    title: "TestTicket2",
    price: 30,
    userId: "TestUserId2"
  }).save();

  const cookie = global.signin();
  const response = await request(app)
    .get(`/api/tickets`)
    .set("Cookie", cookie)
    .send()
    .expect(200);

  expect(response.body.length).toEqual(2);
});
