import { Types } from "mongoose";

import { CreateContactDto } from "../dtos/contact.dto";
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
}

export default ContactService;
