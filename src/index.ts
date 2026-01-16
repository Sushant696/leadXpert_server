import { env } from "./config/env";
import { logger } from "./lib/logger";
import app from "./server";

app.listen(5505, () => {
  // logger.info("Server Started on port : " + env.PORT)
  logger.info("Server Started on port : 5500")
})
