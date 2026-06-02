import { Router } from "express";

import { Roles } from "../constants/roles";
import { middlewares } from "../middlewares/isAuthenticated";
import ContactController from "../controller/contact.controller";
import {
  checkWorkspaceMembership,
  requiredCompanyRole,
} from "../middlewares/hasPermission";

const contactRouter = Router();
const contactController = new ContactController();

// create contact
contactRouter.post(
  "/:workspaceId/contacts",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  requiredCompanyRole([Roles.SUPER_ADMIN, Roles.ADMIN, Roles.AGENT]),
  contactController.createContact,
);

export default contactRouter;
