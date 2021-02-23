import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import { currentUserRouter } from "./routes/current-user";
import signinRouter from "./routes/signin";
import signoutRouter from "./routes/signout";
import signupRouter from "./routes/signup";
import { errorHandler } from "./middlewares/error-handler";
import NotFoundError from "./errors/not-found-error";
import mongoose from "mongoose";

const app = express();
// Middlewares
app.use(json());

// Routes
app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

app.all("*", async () => {
   throw new NotFoundError();
});

// More middlewares
app.use(errorHandler);

const start = async () => {
   try {
      await mongoose.connect("mongodb://auth-mongo-srv:27017/auth", {
         useNewUrlParser: true,
         useUnifiedTopology: true,
         useCreateIndex: true
      });
   } catch (error) {
      console.error(error);
   }

   app.listen(3000, () => {
      console.log("Listening on port 3000!");
   });
};

start();
