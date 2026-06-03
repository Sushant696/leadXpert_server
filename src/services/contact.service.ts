import { Types } from "mongoose";
import { StatusCodes } from "http-status-codes";

import ApiError from "../exceptions/apiError";
import errorMessages from "../constants/errorMessages";
import { CreateContactDto, UpdateContactDto } from "../dtos/contact.dto";
import ContactRepository from "../repositories/contact.repository";

const contactRepository = new ContactRepository();

class ContactService {
  async createContact(
    workspaceId: string,
    userId: string,
    data: CreateContactDto,
  ) {
    const contact = await contactRepository.createContact({
      workspaceId: new Types.ObjectId(workspaceId),
      ...data,
      createdBy: new Types.ObjectId(userId),
    });
    return contact;
  }

  async getContactsByWorkspaceId(
    workspaceId: string,
    options: { search?: string; page: number; limit: number },
  ) {
    const contacts = await contactRepository.getContactsByWorkspaceId(
      workspaceId,
      options,
    );
    return contacts;
  }

  async getContactById(workspaceId: string, contactId: string) {
    const contact = await contactRepository.getContactById(contactId);
    if (!contact) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        errorMessages.CONTACT.NOT_FOUND,
      );
    }
    if (contact.workspaceId.toString() !== workspaceId.toString()) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        errorMessages.AUTHORIZATION.INSUFFICIENT_PERMISSION,
      );
    }
    return contact;
  }

  async updateContact(
    workspaceId: string,
    contactId: string,
    data: UpdateContactDto,
  ) {
    const contact = await contactRepository.getContactById(contactId);
    if (!contact) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        errorMessages.CONTACT.NOT_FOUND,
      );
    }
    if (contact.workspaceId.toString() !== workspaceId.toString()) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        errorMessages.AUTHORIZATION.INSUFFICIENT_PERMISSION,
      );
    }

    const updatedContact = await contactRepository.updateContact(
      contactId,
      data,
    );
    return updatedContact;
  }

  async deleteContact(workspaceId: string, contactId: string) {
    const contact = await contactRepository.getContactById(contactId);
    if (!contact) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        errorMessages.CONTACT.NOT_FOUND,
      );
    }
    if (contact.workspaceId.toString() !== workspaceId.toString()) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        errorMessages.AUTHORIZATION.INSUFFICIENT_PERMISSION,
      );
    }

    await contactRepository.deleteContact(contactId);
  }
}

export default ContactService;
