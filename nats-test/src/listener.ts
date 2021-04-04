import nats, { Message } from "node-nats-streaming";
import {randomBytes} from "crypto";

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

  const options = stan.subscriptionOptions()
    .setManualAckMode(true) // Ensure that the msg is processed by a listener.
    .setDeliverAllAvailable() // Keep a list of undelivered msgs per durable name.
    .setDurableName("accounting-service"); // Set the durable name so that the service gets missed msgs.

  const subscription = stan.subscribe(
    "ticket:created", 
    "queue-group-name", // Set queue group so that msg goes only to one of many and deliver all list is not cleared.
    options
  );
  subscription.on("message", (msg: Message) => {
    const data = msg.getData();

    if (typeof data === "string") {
      console.log(`Received event #${msg.getSequence()}, with data ${data}`);
    }

    msg.ack();
  });
}); 

process.on("SIGINT", () => stan.close());
process.on("SIGTERM", () => stan.close());