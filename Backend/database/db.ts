// Copyright: This script is taken from: https://codesandbox.io/s/typescript-forked-8vscow?file=/src/db.ts
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongod: any;

export const connect = async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose
    .connect(uri, { dbName: "ConnectAndExplore" })
    .then((_result) => console.log("connected...."))
    .catch((err) => console.log(`Cannot connect => ${err}`));
};

/**
 * Close db connection
 */
export const closeDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
};

/**
 * Delete db collections
 */
export const clearDatabase = async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};
