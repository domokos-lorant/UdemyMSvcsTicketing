import express from "express";
// Ensure exceptions from async routes go to error boundary.
import "express-async-errors";
import { json } from "body-parser";
import {
  NotFoundError,
  errorHandler,
  currentUser
} from "@lorantd_study/common";
import cookieSession from "cookie-session";

const app = express();
// Make express trust ingress-nginx proxy
app.set("trust proxy", true);

// Middlewares
app.use(json());
app.use(
  cookieSession({
    signed: false /*No encryption*/,
    secure: process.env.NODE_ENV !== "test" /*Only HTTPS */
  })
);

app.use(currentUser);

// Routes

// Fallback for unkown route
app.all("*", async () => {
  throw new NotFoundError();
});

// More middlewares
app.use(errorHandler);

export { app };
