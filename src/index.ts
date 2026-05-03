import app from "./server";
import { env } from "./config/env";
import { logger } from "./infra/logger/pino";

app.listen(env.PORT || 5500, () => {
  logger.info("Server Started on port : " + env.PORT)
})
