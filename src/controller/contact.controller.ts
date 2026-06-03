import z from "zod";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { CreateContactDto, UpdateContactDto } from "../dtos/contact.dto";
import ApiError from "../exceptions/apiError";
import ApiResponse from "../utils/apiResponse";
import asyncHandler from "../utils/asyncHandler";
import ContactService from "../services/contact.service";
import responseMessages from "../constants/responseMessages";

const contactService = new ContactService();

class ContactController {
  createContact = asyncHandler(async (req: Request, res: Response) => {
    const parsedData = CreateContactDto.safeParse(req.body);
    const userId = req.user?.id;
    const workspaceId = req.params.workspaceId;

    if (!parsedData.success) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        z.prettifyError(parsedData.error),
      );
    }

    const createdContact = await contactService.createContact(
      workspaceId,
      userId,
      parsedData.data,
    );

    return res.status(StatusCodes.CREATED).json(
      new ApiResponse(StatusCodes.CREATED, responseMessages.CONTACT.CREATED, {
        contact: createdContact,
      }),
    );
  });

  getContacts = asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.params.workspaceId;
    const { search, page = 1, limit = 10 } = req.query;

    const contacts = await contactService.getContactsByWorkspaceId(
      workspaceId,
      {
        search: search as string,
        page: Number(page),
        limit: Number(limit),
      },
    );

    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.CONTACT.RETRIEVED, {
        contacts,
      }),
    );
  });

  getContactById = asyncHandler(async (req: Request, res: Response) => {
    const { workspaceId, contactId } = req.params;

    const contact = await contactService.getContactById(
      workspaceId,
      contactId,
    );

    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.CONTACT.RETRIEVED, {
        contact,
      }),
    );
  });

  updateContact = asyncHandler(async (req: Request, res: Response) => {
    const parsedData = UpdateContactDto.safeParse(req.body);
    const { workspaceId, contactId } = req.params;

    if (!parsedData.success) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        z.prettifyError(parsedData.error),
      );
    }

    const updatedContact = await contactService.updateContact(
      workspaceId,
      contactId,
      parsedData.data,
    );

    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.CONTACT.UPDATED, {
        contact: updatedContact,
      }),
    );
  });

  deleteContact = asyncHandler(async (req: Request, res: Response) => {
    const { workspaceId, contactId } = req.params;

    await contactService.deleteContact(workspaceId, contactId);

    return res.json(
      new ApiResponse(StatusCodes.OK, responseMessages.CONTACT.DELETED, {}),
    );
  });
}

export default ContactController;
