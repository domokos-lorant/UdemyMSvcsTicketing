import Ticket from "../ticket";

it("implements optimistic concurrency control", async () => {
  // Create a ticket instance.
  const ticket = Ticket.build({
    title: "concert",
    price: 5,
    userId: "testUserId"
  });

  // Save it to DB.
  await ticket.save();

  // Fetch the ticket twice.
  const firstTicketInstance = await Ticket.findById(ticket.id);
  const secondTicketInstance = await Ticket.findById(ticket.id);

  // Make two separate changes.
  firstTicketInstance!.set({ price: 10 });
  secondTicketInstance!.set({ price: 15 });

  // Save the first fetched ticket.
  await firstTicketInstance!.save();

  // Save the second fetched ticket and expect and error.
  await expect(secondTicketInstance!.save()).rejects.toThrow();
});

it("increments the version number on multiple saves", async () => {
  const ticket = Ticket.build({
    title: "concert",
    price: 5,
    userId: "testUserId"
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
