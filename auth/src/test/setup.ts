import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

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
