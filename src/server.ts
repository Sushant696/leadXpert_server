import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import type { Application, Request, Response } from "express";

import mainRouter from "./routes";
import { env } from "./config/env";
import corsConfig from "./utils/corsConfig";
import { rateLimiter } from "./utils/rateLimiter";
import { httpLogger } from "./infra/logger/httpLogger";
import errorHandler from "./exceptions/errorHandler";

const app: Application = express();

app.use(cors(corsConfig));
app.use(rateLimiter);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(httpLogger);

app.use(`/${env.VERSION}/api/`, mainRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("LeadXpert api home page!");
});

app.use(errorHandler);

export default app;
