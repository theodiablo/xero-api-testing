import { Account, XeroClient } from "xero-node";

export const getBankAccount = async (
  xeroClient: XeroClient
): Promise<Account> => {
  try {
    const contactsResponse = await xeroClient.accountingApi.getAccounts(
      xeroClient.tenants[0].tenantId,
      undefined,
      'Type=="BANK"'
    );

    return contactsResponse.body.accounts![0];
  } catch (e: any) {
    console.log(e);
    console.log(e.response.statusCode);
    console.log(e.body);
    throw e;
  }
};
export const getAccountCodes = async (
  xeroClient: XeroClient
): Promise<Account[]> => {
  const SPEND_ACCOUNT_TYPES = ["DIRECTCOSTS", "FIXED", "OVERHEADS"];

  try {
    const contactsResponse = await xeroClient.accountingApi.getAccounts(
      xeroClient.tenants[0].tenantId,
      undefined,
      SPEND_ACCOUNT_TYPES.map((type) => `TYPE=="${type}"`).join("||")
    );

    return contactsResponse.body.accounts || [];
  } catch (e: any) {
    console.log(e);
    console.log(e.response.statusCode);
    console.log(e.body);
    throw e;
  }
};
