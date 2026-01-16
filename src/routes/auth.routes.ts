import { Router } from "express";
import { AuthController } from "../controller/auth.controller";
import { middlewares } from "../middlewares/isAuthenticated";

const authRouter = Router()

const authcontroller = new AuthController();

authRouter.get("/current", middlewares.isAuthenticated, authcontroller.getCurrentUser)
authRouter.post("/login", authcontroller.loginUser)
authRouter.post("/register", authcontroller.createUser)

export default authRouter