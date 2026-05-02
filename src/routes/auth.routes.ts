import { Router } from "express";

import { middlewares } from "../middlewares/isAuthenticated";
import { AuthController } from "../controller/auth.controller";

const authRouter = Router()
const authcontroller = new AuthController();

authRouter.post(
  "/mee",
  middlewares.isAuthenticated,
  authcontroller.getCurrentUser
);
authRouter.post("/login", authcontroller.loginUser)
authRouter.post("/register", authcontroller.createUser)

export default authRouter