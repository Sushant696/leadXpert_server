import mongoose from "mongoose";
import { env } from "./env"
import pino from "pino";
import { logger } from "../lib/logger";

const connectDB = async () => {
  try {
    const mongodbURI = env.MONGODB_URI || "";
    await mongoose.connect(mongodbURI)

    mongoose.connection.on("error", (err) => {
      logger.error("Mongodb connection error", err)
    })

    mongoose.connection.on("disconnected", (err) => {
      logger.error("Mongodb disconnected", err)
    })
    logger.info("Mongodb connected successfully")

  } catch (error: any) {

    logger.error(error)
    process.exit(1);

  }
}

export default connectDB

