import { Router } from "express";
import authRouter from "./auth.routes";
import userRouter from "./user.rotues";
import uploadRouter from "./upload.routes";
import workspaceRouter from "./workspace.routes";
import pipelineRouter from "./pipeline.routes";
import pipelineStageRouter from "./pipeline-stage.routes";

const mainRouter = Router();

mainRouter.use("/auth", authRouter);
mainRouter.use("/users", userRouter);
mainRouter.use("/upload", uploadRouter);
mainRouter.use("/pipeline", pipelineRouter);
mainRouter.use("/workspace", workspaceRouter);
mainRouter.use("/pipeline-stage", pipelineStageRouter);

export default mainRouter;
