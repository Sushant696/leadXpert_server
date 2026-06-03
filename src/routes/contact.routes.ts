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

// get all contacts (with search)
contactRouter.get(
  "/:workspaceId/contacts",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  contactController.getContacts,
);

// get single contact
contactRouter.get(
  "/:workspaceId/contacts/:contactId",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  contactController.getContactById,
);

// update contact
contactRouter.patch(
  "/:workspaceId/contacts/:contactId",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  requiredCompanyRole([Roles.SUPER_ADMIN, Roles.ADMIN, Roles.AGENT]),
  contactController.updateContact,
);

// delete contact
contactRouter.delete(
  "/:workspaceId/contacts/:contactId",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  requiredCompanyRole([Roles.SUPER_ADMIN, Roles.ADMIN]),
  contactController.deleteContact,
);

export default contactRouter;
