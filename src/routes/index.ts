import { Router } from "express";
import authRouter from "./auth.routes";
import userRouter from "./user.rotues";
import uploadRouter from "./upload.routes";

const mainRouter = Router()

mainRouter.use("/auth", authRouter)
mainRouter.use("/users", userRouter)
mainRouter.use("/upload", uploadRouter)

export default mainRouter
