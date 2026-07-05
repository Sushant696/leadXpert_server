import { Types } from "mongoose";
import { StatusCodes } from "http-status-codes";

import ApiError from "../exceptions/apiError";
import errorMessages from "../constants/errorMessages";
import { CreateNoteDto, UpdateNoteDto } from "../dtos/note.dto";
import NoteRepository from "../repositories/note.repository";
import { Lead } from "../models/lead.model";
import { emitLeadEvent } from "../lib/eventBus";

const noteRepository = new NoteRepository();

class NoteService {
  async createNote(
    workspaceId: string,
    userId: string,
    noteData: CreateNoteDto,
  ) {
    const note = await noteRepository.createNote({
      workspaceId: new Types.ObjectId(workspaceId),
      createdBy: new Types.ObjectId(userId),
      entityType: noteData.entityType,
      entityId: new Types.ObjectId(noteData.entityId),
      content: noteData.content,
      isPinned: noteData.isPinned,
    });

    if (noteData.entityType === "LEAD") {
      await Lead.findByIdAndUpdate(noteData.entityId, { $inc: { noteCount: 1 } });
      emitLeadEvent(noteData.entityId, "note");
    }

    return note;
  }

  async getNotesByEntity(
    workspaceId: string,
    entityType: string,
    entityId: string,
  ) {
    const notes = await noteRepository.getNotesByEntity(entityType, entityId);
    return notes;
  }

  async updateNote(workspaceId: string, noteId: string, data: UpdateNoteDto) {
    const note = await noteRepository.getNoteById(noteId);

    if (!note) {
      throw new ApiError(StatusCodes.NOT_FOUND, errorMessages.NOTE.NOT_FOUND);
    }

    if (note.workspaceId.toString() !== workspaceId) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        errorMessages.AUTHORIZATION.INSUFFICIENT_PERMISSION,
      );
    }

    const updatedNote = await noteRepository.updateNote(noteId, data);

    if (note.entityType === "LEAD") {
      emitLeadEvent(note.entityId.toString(), "note");
    }

    return updatedNote;
  }

  async deleteNote(workspaceId: string, noteId: string) {
    const note = await noteRepository.getNoteById(noteId);

    if (!note) {
      throw new ApiError(StatusCodes.NOT_FOUND, errorMessages.NOTE.NOT_FOUND);
    }

    if (note.workspaceId.toString() !== workspaceId) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        errorMessages.AUTHORIZATION.INSUFFICIENT_PERMISSION,
      );
    }

    if (note.entityType === "LEAD") {
      await Lead.findByIdAndUpdate(note.entityId, { $inc: { noteCount: -1 } });
      emitLeadEvent(note.entityId.toString(), "note");
    }

    await noteRepository.deleteNote(noteId);
  }
}

export default NoteService;
