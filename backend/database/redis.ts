import { createClient } from "redis";
import logger from "../lib/logger";

const redis = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379"
});

redis.connect().catch(logger.error);

export default redis;
