import { Contact, XeroClient } from "xero-node";

export const getContacts = async (
  xeroClient: XeroClient
): Promise<Contact[]> => {
  try {
    const contactsResponse = await xeroClient.accountingApi.getContacts(
      xeroClient.tenants[0].tenantId
    );

    return contactsResponse.body.contacts!;
  } catch (e: any) {
    console.log(e);
    console.log(e.response.statusCode);
    console.log(e.body);
    throw e;
  }
};

export async function createContacts(
  xeroClient: XeroClient,
  contactNames: string[]
): Promise<Contact[]> {
  const createContactResponse = await xeroClient.accountingApi.createContacts(
    xeroClient.tenants[0].tenantId,
    {
      contacts: contactNames.map((contactName) => ({
        name: contactName,
      })),
    }
  );

  return createContactResponse.body.contacts!;
}
