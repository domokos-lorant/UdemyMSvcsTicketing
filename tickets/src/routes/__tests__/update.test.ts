import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import Ticket from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

it("returns a 404 if the provided id does not exist", async () => {
  const cookie = global.signin();
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", cookie)
    .send({
      title: "UpdatedTitle",
      price: 50
    })
    .expect(404);
});

it("returns a 401 if the user is not authenticated", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: "UpdatedTitle",
      price: 50
    })
    .expect(401);
});

it("returns a 401 if the user does not own the ticket", async () => {
  // Add a ticket that is not owned
  const notOwnedTicket = await Ticket.build({
    title: "TestTicket",
    price: 20,
    userId: "TestUserId"
  }).save();

  const cookie = global.signin();
  await request(app)
    .put(`/api/tickets/${notOwnedTicket.id}`)
    .set("Cookie", cookie)
    .send({
      title: "UpdatedTitle",
      price: 50
    })
    .expect(401);
});

it("returns a 400 if the user provide and invalid title or price", async () => {
  // Add a ticket that is owned by user.
  const userId = "TestUserId";
  const cookie = global.signin(userId);

  const ownedTicket = await Ticket.build({
    title: "TestTicket",
    price: 20,
    userId
  }).save();

  await request(app)
    .put(`/api/tickets/${ownedTicket.id}`)
    .set("Cookie", cookie)
    .send({
      title: "",
      price: 50
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${ownedTicket.id}`)
    .set("Cookie", cookie)
    .send({
      price: 50
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${ownedTicket.id}`)
    .set("Cookie", cookie)
    .send({
      title: "UpdatedTitle",
      price: -10
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${ownedTicket.id}`)
    .set("Cookie", cookie)
    .send({
      title: "UpdatedTitle"
    })
    .expect(400);
});

it("update the ticket with valid inputs", async () => {
  // Add a ticket that is owned by user.
  const userId = "TestUserId";
  const cookie = global.signin(userId);

  const ownedTicket = await Ticket.build({
    title: "TestTicket",
    price: 20,
    userId
  }).save();

  const updatedTicket = {
    title: "UpdatedTicket",
    price: 50
  };
  const response = await request(app)
    .put(`/api/tickets/${ownedTicket.id}`)
    .set("Cookie", cookie)
    .send(updatedTicket)
    .expect(200);

  expect(response.body.price).toEqual(updatedTicket.price);
  expect(response.body.title).toEqual(updatedTicket.title);

  // Check ticket in DB.
  const tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].price).toEqual(updatedTicket.price);
  expect(tickets[0].title).toEqual(updatedTicket.title);
});

it("publishes an event", async () => {
  // Add a ticket that is owned by user.
  const userId = "TestUserId";
  const cookie = global.signin(userId);

  const ownedTicket = await Ticket.build({
    title: "TestTicket",
    price: 20,
    userId
  }).save();

  const updatedTicket = {
    title: "UpdatedTicket",
    price: 50
  };
  await request(app)
    .put(`/api/tickets/${ownedTicket.id}`)
    .set("Cookie", cookie)
    .send(updatedTicket)
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1);
});
