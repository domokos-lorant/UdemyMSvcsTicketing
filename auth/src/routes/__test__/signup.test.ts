import request from "supertest";
import { app } from "../../app";

it("returns a 201 on successful signup", async () => {
   return request(app)
      .post("/api/users/signup")
      .send({
         email: "test@test.com",
         password: "password"
      })
      .expect(201);
});

it("returns 400 with an invalid email", async () => {
   return request(app)
      .post("/api/users/signup")
      .send({
         email: "invalidEmail",
         password: "password"
      })
      .expect(400);
});

it("returns 400 with an invalid password", async () => {
   return request(app)
      .post("/api/users/signup")
      .send({
         email: "test@test.com",
         password: "bad"
      })
      .expect(400);
});

it("returns 400 with missing email and password", async () => {
   return request(app).post("/api/users/signup").send({}).expect(400);
});

it("dissalows duplicate email", async () => {
   await request(app)
      .post("/api/users/signup")
      .send({
         email: "test@test.com",
         password: "password"
      })
      .expect(201);

   await request(app)
      .post("/api/users/signup")
      .send({
         email: "test@test.com",
         password: "password2"
      })
      .expect(400);
});

it("returns a cookie on successful signup", async () => {
   const response = await request(app)
      .post("/api/users/signup")
      .send({
         email: "test@test.com",
         password: "password"
      })
      .expect(201);

   expect(response.get("Set-Cookie")).toBeDefined();
});
