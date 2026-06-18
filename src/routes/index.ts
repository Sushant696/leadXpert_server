import { Router } from "express";
import authRouter from "./auth.routes";
import userRouter from "./user.rotues";
import uploadRouter from "./upload.routes";
import workspaceRouter from "./workspace.routes";
import pipelineRouter from "./pipeline.routes";
import pipelineStageRouter from "./pipeline-stage.routes";
import contactRouter from "./contact.routes";
import leadRouter from "./lead.routes";
import taskRouter from "./task.routes";
import noteRouter from "./note.routes";
import dealRouter from "./deal.routes";

const mainRouter = Router();

mainRouter.use("/auth", authRouter);
mainRouter.use("/users", userRouter);
mainRouter.use("/leads", leadRouter);
mainRouter.use("/deals", dealRouter);
mainRouter.use("/tasks", taskRouter);
mainRouter.use("/notes", noteRouter);
mainRouter.use("/upload", uploadRouter);
mainRouter.use("/contact", contactRouter);
mainRouter.use("/pipeline", pipelineRouter);
mainRouter.use("/workspace", workspaceRouter);
mainRouter.use("/pipeline-stage", pipelineStageRouter);

export default mainRouter;
