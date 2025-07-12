import { createClient } from "redis";

export const redis = await createClient()
  .on("error", (err) => console.log("Redis Client Error", err))
  .connect();

export const redisPublisher = await createClient()
  .on("error", (err) => console.log("Redis Client Error", err))
  .connect();
