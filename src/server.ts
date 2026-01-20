import cors from "cors"
import express from "express";
import cookieParser from "cookie-parser"
import type { Application, NextFunction, Request, Response } from "express";

import mainRouter from "./routes";
import { env } from "./config/env";
import connectDB from "./config/db";
import { logger } from "./lib/logger";
import rateLimiter from "./utils/rateLimiter";
import { httpLogger } from "./lib/http-logger";
import corsConfig from "./utils/corsConfig";

const app: Application = express()

app.use(cors(corsConfig));
app.use(rateLimiter);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(`/${env.VERSION}/api/`, mainRouter)

app.get("/", (req: Request, res: Response) => {
  res.send("LeadXpert api home page!")
})

connectDB()

app.use(httpLogger)

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || 500;
  logger.error(err)

  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app