import { Types } from "mongoose";
import { Note, NoteDocument, INote } from "../models/note.model";

interface INoteRepository {
  createNote(noteData: Partial<INote>): Promise<NoteDocument>;
  getNoteById(noteId: string): Promise<NoteDocument | null>;
  getNotesByEntity(
    entityType: string,
    entityId: string,
  ): Promise<NoteDocument[]>;
  updateNote(noteId: string, noteData: Partial<INote>): Promise<NoteDocument | null>;
  deleteNote(noteId: string): Promise<void>;
}

class NoteRepository implements INoteRepository {
  async createNote(noteData: Partial<INote>): Promise<NoteDocument> {
    return await Note.create(noteData);
  }

  async getNoteById(noteId: string): Promise<NoteDocument | null> {
    return await Note.findById(noteId).populate("createdBy", "name email");
  }

  async getNotesByEntity(
    entityType: string,
    entityId: string,
  ): Promise<NoteDocument[]> {
    return await Note.find({
      entityType,
      entityId: new Types.ObjectId(entityId),
    })
      .populate("createdBy", "name email")
      .sort({ isPinned: -1, createdAt: -1 });
  }

  async updateNote(
    noteId: string,
    noteData: Partial<INote>,
  ): Promise<NoteDocument | null> {
    return await Note.findByIdAndUpdate(
      noteId,
      {
        ...noteData,
        isEdited: true,
        editedAt: new Date(),
      },
      { new: true },
    );
  }

  async deleteNote(noteId: string): Promise<void> {
    await Note.findByIdAndDelete(noteId);
  }
}

export default NoteRepository;
