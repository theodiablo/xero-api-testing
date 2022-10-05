import * as fs from "fs";
import { Contact, XeroClient } from "xero-node";

export class XeroContact {
  private contacts: Contact[] = [];

  constructor(private readonly xeroClient: XeroClient) {}

  public async init(contactNames: string[]): Promise<void> {
    this.contacts = await this.loadXeroContacts();
    await this.createMissingContacts(contactNames);

    this.contacts = this.contacts.filter((contact) => {
      return contactNames.includes(`${contact.name}`);
    });
  }

  public getRandomContact(): Contact {
    const randomIndex = Math.floor(Math.random() * this.contacts.length);
    return this.contacts[randomIndex];
  }

  public getContacts(): Contact[] {
    return this.contacts;
  }

  private contactExists(contactName: string): boolean {
    return this.contacts.some(
      (contact) => contact.name?.toLowerCase() === contactName.toLowerCase()
    );
  }

  private async loadXeroContacts(): Promise<Contact[]> {
    try {
      const contactsResponse = await this.xeroClient.accountingApi.getContacts(
        this.xeroClient.tenants[0].tenantId
      );

      return contactsResponse.body.contacts!;
    } catch (e: any) {
      throw e;
    }
  }

  private async createContacts(contactNames: string[]): Promise<Contact[]> {
    try {
      const createContactResponse =
        await this.xeroClient.accountingApi.createContacts(
          this.xeroClient.tenants[0].tenantId,
          {
            contacts: contactNames.map((contactName) => ({
              name: contactName,
            })),
          }
        );

      return createContactResponse.body.contacts!;
    } catch (error) {
      console.error("Error creating contacts", error);
      throw error;
    }
  }

  private async createMissingContacts(contactNames: string[]): Promise<void> {
    const missingContactNames = contactNames.filter(
      (contactName) =>
        contactName.length > 0 && !this.contactExists(contactName)
    );
    if (missingContactNames && missingContactNames.length > 0) {
      console.debug("Missing contacts", missingContactNames);
      const batchedArrays: Array<Array<string>> = [];
      const batchSize = 100;
      for (
        let i = 0, len = missingContactNames.length;
        i < len;
        i += batchSize
      ) {
        batchedArrays.push(missingContactNames.slice(i, i + batchSize));
      }

      for (const contactNames of batchedArrays) {
        console.debug("Create contacts:", contactNames);
        const createdContacts = await this.createContacts(contactNames);
        this.contacts.push(...createdContacts);
      }
      console.debug("Contacts created");
    }
  }
}
