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
    })
  }

  public getRandomContact(): Contact {
    const randomIndex = Math.floor(Math.random() * this.contacts.length);
    return this.contacts[randomIndex];
  }

  public getContacts(): Contact[] {
    return this.contacts;
  }

  private findContactByName(contactName: string): Contact | undefined {
    const contact = this.contacts.find(
      (contact) => contact.name === contactName
    );
    if (contact) {
      return contact;
    } else {
      console.log(`Could not find contact ${contactName}`);
      return undefined;
    }
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
  }

  private async createMissingContacts(contactNames: string[]): Promise<void> {
    const missingContactNames = contactNames.filter((contactName) => {
      const existingContact = this.findContactByName(contactName);
      return existingContact === undefined && contactName.length > 0;
    });
    if (missingContactNames && missingContactNames.length > 0) {
      const batchedArrays: Array<Array<string>> = [];
      const batchSize = 25;
      for (
        let i = 0, len = missingContactNames.length;
        i < len;
        i += batchSize
      ) {
        batchedArrays.push(missingContactNames.slice(i, i + batchSize));
      }

      for (const contactNames of batchedArrays) {
        console.log("Create contacts:", contactNames);
        const createdContacts = await this.createContacts(contactNames);
        this.contacts.push(...createdContacts);
      }
      console.log("Contacts created");
    }
  }
}
