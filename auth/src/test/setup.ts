import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../app";

declare global {
   // eslint-disable-next-line @typescript-eslint/no-namespace
   namespace NodeJS {
      interface Global {
         signin(): Promise<string[]>;
      }
   }
}

let mongo: MongoMemoryServer;

beforeAll(async () => {
   process.env.JWT_KEY = "asdfasdf";

   mongo = new MongoMemoryServer();
   const mongoUri = await mongo.getUri();

   await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
   });
});

beforeEach(async () => {
   const collections = await mongoose.connection.db.collections();
   collections.forEach(async (collection) => await collection.deleteMany({}));
});

afterAll(async () => {
   await mongo.stop();
   await mongoose.connection.close();
});

global.signin = async () => {
   const email = "test@test.com";
   const password = "password";

   const signupResponse = await request(app)
      .post("/api/users/signup")
      .send({
         email,
         password
      })
      .expect(201);

   const cookie = signupResponse.get("Set-Cookie");
   return cookie;
};
