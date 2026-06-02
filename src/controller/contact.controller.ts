import z from "zod";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { CreateContactDto } from "../dtos/contact.dto";
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
}

export default ContactController;
