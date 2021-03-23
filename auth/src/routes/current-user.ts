import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

router.get("/api/users/currentuser", (req, res) => {
   const token = req.session?.jwt;

   if (!token) {
      return res.send({ currentUser: null });
   }

   try {
      const payload = jwt.verify(token, process.env.JWT_KEY!);
      res.send({ currentUser: payload });
   } catch (error) {
      res.send({ currentUser: null });
   }
});

export { router as currentUserRouter };
