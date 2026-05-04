import { Router } from "express";

import { System_Roles } from "../constants/roles";
import UserController from "../controller/user.controller";
import { middlewares } from "../middlewares/isAuthenticated";
import { systemLevelAccessCheck } from "../middlewares/hasPermission";

const userRouter = Router()
const userController = new UserController()

// user only routes
userRouter.patch(
  "/update",
  middlewares.isAuthenticated,
  userController.updateUser
)

// admin only routes
userRouter.get("/",
  middlewares.isAuthenticated,
  systemLevelAccessCheck([System_Roles.ADMIN]),
  userController.getAllUsers
);

userRouter.get("/:userId",
  middlewares.isAuthenticated,
  systemLevelAccessCheck([System_Roles.ADMIN]),
  userController.getUserById);

userRouter.delete("/:userId",
  middlewares.isAuthenticated,
  systemLevelAccessCheck([System_Roles.ADMIN]),
  userController.deleteUserById
);

export default userRouter
