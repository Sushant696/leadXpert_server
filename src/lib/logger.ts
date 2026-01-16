import pino from "pino";
import { env } from "../config/env";

const isProd = env.NODE_ENV == "production";

export const logger = pino({
  level: isProd ? "info" : "debug",
  transport: !isProd ?
    {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "yyyy-mm-dd HH:MM:ss",
        ignore: "pid,hostname"
      }
    } : undefined
})
