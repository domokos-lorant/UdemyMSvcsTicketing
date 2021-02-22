import express from "express";

const signoutRouter = express.Router();

signoutRouter.post("/api/users/signout", (req, res) => {
  res.send("Hi there!");
});

export default signoutRouter;
