import app from "./server";
import { env } from "./config/env";
import { logger } from "./lib/logger";

app.listen(env.PORT || 5500, () => {
  logger.info("Server Started on port : " + env.PORT)
})
