import app from "./server";
import { env } from "./config/env";
import { logger } from "./infra/logger/pino";
import connectDB from "./config/db";

async function startServer() {
  connectDB();

  app.listen(parseInt(env.PORT) || 5500, '0.0.0.0', () => {
    logger.info(`Server Started on port : ${env.PORT}`);
    logger.info(`Network access: http://192.168.2.211:${env.PORT}`);
  });
}
startServer();
