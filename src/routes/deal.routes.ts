import { Router } from "express";

import {
  checkWorkspaceMembership,
  requiredCompanyRole,
} from "../middlewares/hasPermission";
import { Roles } from "../constants/roles";
import { middlewares } from "../middlewares/isAuthenticated";
import DealController from "../controller/deal.controller";

const dealRouter = Router();
const dealController = new DealController();

// create deal
dealRouter.post(
  "/:workspaceId/deals",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  requiredCompanyRole([Roles.SUPER_ADMIN, Roles.ADMIN, Roles.AGENT]),
  dealController.createDeal,
);

// get all deals
dealRouter.get(
  "/:workspaceId/deals",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  dealController.getDeals,
);

// get single deal
dealRouter.get(
  "/:workspaceId/deals/:dealId",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  dealController.getDealById,
);

// update deal
dealRouter.patch(
  "/:workspaceId/deals/:dealId",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  requiredCompanyRole([Roles.SUPER_ADMIN, Roles.ADMIN, Roles.AGENT]),
  dealController.updateDeal,
);

export default dealRouter;
    
