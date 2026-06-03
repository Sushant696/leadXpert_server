import { Contact, ContactDocument, IContact } from "../models/contact.model";

class ContactRepository {
  async createContact(contact: Partial<IContact>): Promise<ContactDocument> {
    return await Contact.create(contact);
  }

  async getContactsByWorkspaceId(
    workspaceId: string,
    options: { search?: string; page: number; limit: number },
  ): Promise<ContactDocument[]> {
    const skip = (options.page - 1) * options.limit;
    const query: any = { workspaceId };

    if (options.search) {
      query.$or = [
        { name: { $regex: options.search, $options: "i" } },
        { email: { $regex: options.search, $options: "i" } },
        { phone: { $regex: options.search, $options: "i" } },
      ];
    }

    return await Contact.find(query)
      .skip(skip)
      .limit(options.limit)
      .sort({ createdAt: -1 });
  }

  async getContactById(contactId: string): Promise<ContactDocument | null> {
    return await Contact.findById(contactId);
  }

  async updateContact(
    contactId: string,
    data: Partial<IContact>,
  ): Promise<ContactDocument | null> {
    return await Contact.findByIdAndUpdate(contactId, data, { new: true });
  }

  async deleteContact(contactId: string): Promise<void> {
    await Contact.findByIdAndDelete(contactId);
  }
}

export default ContactRepository;
