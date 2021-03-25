import express from "express";
// Ensure exceptions from async routes go to error boundary.
import "express-async-errors";
import { json } from "body-parser";
import { currentUserRouter } from "./routes/current-user";
import signinRouter from "./routes/signin";
import signoutRouter from "./routes/signout";
import signupRouter from "./routes/signup";
import { errorHandler } from "./middlewares/error-handler";
import NotFoundError from "./errors/not-found-error";
import cookieSession from "cookie-session";

const app = express();
// Make express trust ingress-nginx proxy
app.set("trust proxy", true);

// Middlewares
app.use(json());
app.use(
   cookieSession({
      signed: false /*No encryption*/,
      secure: true /*Only HTTPS */
   })
);

// Routes
app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

// Fallback for unkown route
app.all("*", async () => {
   throw new NotFoundError();
});

// More middlewares
app.use(errorHandler);

export { app };
