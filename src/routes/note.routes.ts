import { Router } from "express";

import {
  checkWorkspaceMembership,
  requiredCompanyRole,
} from "../middlewares/hasPermission";
import { Roles } from "../constants/roles";
import { middlewares } from "../middlewares/isAuthenticated";
import NoteController from "../controller/note.controller";

const noteRouter = Router();
const noteController = new NoteController();

// create note
noteRouter.post(
  "/:workspaceId/notes",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  requiredCompanyRole([Roles.SUPER_ADMIN, Roles.ADMIN, Roles.AGENT]),
  noteController.createNote,
);

// get notes for entity
noteRouter.get(
  "/:workspaceId/notes/:entityType/:entityId",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  noteController.getNotes,
);

// update note
noteRouter.patch(
  "/:workspaceId/notes/:noteId",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  requiredCompanyRole([Roles.SUPER_ADMIN, Roles.ADMIN, Roles.AGENT]),
  noteController.updateNote,
);

// delete note
noteRouter.delete(
  "/:workspaceId/notes/:noteId",
  middlewares.isAuthenticated,
  checkWorkspaceMembership,
  requiredCompanyRole([Roles.SUPER_ADMIN, Roles.ADMIN]),
  noteController.deleteNote,
);

export default noteRouter;
