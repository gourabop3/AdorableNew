import { createClient } from "redis";

// Helper to get a connected Redis client (for serverless)
export async function getRedisClient() {
  const client = createClient({
    url: process.env.REDIS_URL,
  });
  client.on("error", (err) => console.log("Redis Client Error", err));
  await client.connect();
  return client;
}

// Usage example (replace all direct uses of 'redis' and 'redisPublisher' with this):
// const redis = await getRedisClient();
// await redis.set(...)
// await redis.get(...)
// await redis.quit();
