import request from "supertest";
import { app } from "../../app";
import Ticket from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

it("has a route handler for /api/tickets for post requests", async () => {
  const response = await request(app).post("/api/tickets").send({});

  expect(response.status).not.toEqual(404);
});

it("can only by accessed if user is signed in", async () => {
  const response = await request(app).post("/api/tickets").send({});

  expect(response.status).toEqual(401);
});

it("returns status other than 401 if user is signed in", async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({});

  expect(response.status).not.toEqual(401);
});

it("returns an error if an invalid title is provided", async () => {
  const cookie = global.signin();
  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "",
      price: 10
    })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      price: 10
    })
    .expect(400);
});

it("returns an error if an invalid price is provided", async () => {
  const cookie = global.signin();
  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "Test",
      price: -10
    })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "Test"
    })
    .expect(400);
});

it("creates a ticket with valid inputs", async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  const cookie = global.signin();
  const ticket = {
    title: "Test",
    price: 20
  };
  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send(ticket)
    .expect(201);

  // Check ticket in DB.
  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].price).toEqual(ticket.price);
  expect(tickets[0].title).toEqual(ticket.title);
});

it("publishes an event", async () => {
  const cookie = global.signin();
  const ticket = {
    title: "Test",
    price: 20
  };
  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send(ticket)
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1);
});
