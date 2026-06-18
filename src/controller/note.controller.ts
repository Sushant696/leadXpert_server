import { Request, Response } from "express";
import z from "zod";
import { StatusCodes } from "http-status-codes";

import { CreateNoteDto, UpdateNoteDto } from "../dtos/note.dto";
import ApiError from "../exceptions/apiError";
import ApiResponse from "../utils/apiResponse";
import asyncHandler from "../utils/asyncHandler";
import NoteService from "../services/note.service";
import responseMessages from "../constants/responseMessages";

const noteService = new NoteService();

class NoteController {
  createNote = asyncHandler(async (req: Request, res: Response) => {
    const parsedData = CreateNoteDto.safeParse(req.body);
    const userId = req.user?.id;
    const workspaceId = req.params.workspaceId;

    if (!parsedData.success) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        z.prettifyError(parsedData.error),
      );
    }

    const note = await noteService.createNote(
      workspaceId,
      userId,
      parsedData.data,
    );

    return res.status(StatusCodes.CREATED).json(
      new ApiResponse(StatusCodes.CREATED, responseMessages.NOTE.CREATED, {
        note,
      }),
    );
  });

  getNotes = asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.params.workspaceId;
    const entityType = req.params.entityType;
    const entityId = req.params.entityId;

    const notes = await noteService.getNotesByEntity(
      workspaceId,
      entityType,
      entityId,
    );

    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.NOTE.RETRIEVED, {
        notes,
      }),
    );
  });

  updateNote = asyncHandler(async (req: Request, res: Response) => {
    const parsedData = UpdateNoteDto.safeParse(req.body);
    const workspaceId = req.params.workspaceId;
    const noteId = req.params.noteId;

    if (!parsedData.success) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        z.prettifyError(parsedData.error),
      );
    }

    const note = await noteService.updateNote(
      workspaceId,
      noteId,
      parsedData.data,
    );

    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.NOTE.UPDATED, {
        note,
      }),
    );
  });

  deleteNote = asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.params.workspaceId;
    const noteId = req.params.noteId;

    await noteService.deleteNote(workspaceId, noteId);

    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.NOTE.DELETED),
    );
  });
}

export default NoteController;
