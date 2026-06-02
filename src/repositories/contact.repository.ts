import { Contact, ContactDocument, IContact } from "../models/contact.model";

class ContactRepository {
  async createContact(contact: Partial<IContact>): Promise<ContactDocument> {
    return await Contact.create(contact);
  }
}

export default ContactRepository;
