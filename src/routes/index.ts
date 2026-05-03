import { Router } from "express";
import authRouter from "./auth.routes";
import uploadRouter from "./upload.routes";

const mainRouter = Router()

mainRouter.use("/auth", authRouter)
mainRouter.use("/upload", uploadRouter)


export default mainRouter
