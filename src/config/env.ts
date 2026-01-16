import dotenv from "dotenv"
import type { StringValue } from "ms"

dotenv.config()

function requiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`❌ Missing environment variable: ${key}`);
  }
  return value;
}

export const env = {
  MONGODB_URI: requiredEnv("MONGODB_URI"),
  PEPPER: requiredEnv("PEPPER"),
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: process.env.PORT ?? "3000",
  VERSION: process.env.VERSION ?? "v1",
  ACCESS_TOKEN_SECRET: requiredEnv("ACCESS_TOKEN_SECRET"),
  REFRESH_TOKEN_SECRET: requiredEnv("REFRESH_TOKEN_SECRET"),
  ACCESS_TOKEN_EXPIRY: requiredEnv("ACCESS_TOKEN_EXPIRY") as StringValue,
  REFRESH_TOKEN_EXPIRY: requiredEnv("REFRESH_TOKEN_EXPIRY") as StringValue,
}
