import { Account, XeroClient } from "xero-node";

export const getBankAccount = async (
  xeroClient: XeroClient
): Promise<Account> => {
  try {
    const contactsResponse = await xeroClient.accountingApi.getAccounts(
      xeroClient.tenants[0].tenantId
    );

    return contactsResponse.body.accounts![0];
  } catch (e: any) {
    console.log(e);
    console.log(e.response.statusCode);
    console.log(e.body);
    throw e;
  }
};
