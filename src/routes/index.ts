import { Router } from "express";
import authRouter from "./auth.routes";
import userRouter from "./user.rotues";
import uploadRouter from "./upload.routes";
import workspaceRouter from "./workspace.routes";

const mainRouter = Router()

mainRouter.use("/auth", authRouter)
mainRouter.use("/users", userRouter)
mainRouter.use("/upload", uploadRouter)
mainRouter.use("/workspace", workspaceRouter)

export default mainRouter
