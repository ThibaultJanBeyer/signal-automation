import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: "https://eu1-informed-bird-39574.upstash.io",
  token: process.env.UPSTASH_REDIS_TOKEN!,
});
