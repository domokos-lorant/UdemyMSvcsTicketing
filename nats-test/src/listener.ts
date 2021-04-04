import nats from "node-nats-streaming";
import {randomBytes} from "crypto";
import { TicketCreatedListener } from "./ticket-created-listener";

console.clear();

const stan = nats.connect("ticketing", randomBytes(4).toString("hex"), {
  url: "http://localhost:4222"
});

stan.on("connect", () => {
  console.log("Listener connected to NATS");

  stan.on("close", () => {
    console.log("NATS connection closed!");
    process.exit();
  })

  new TicketCreatedListener(stan).listen();

}); 

// Try to close NATS connection so that no more messages are sent this way.
process.on("SIGINT", () => stan.close());
process.on("SIGTERM", () => stan.close());