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
  xeroClient: XeroClient,
  accountTypes?: string[]
): Promise<Account[]> => {
  try {
    const accountCodesResponse = await xeroClient.accountingApi.getAccounts(
      xeroClient.tenants[0].tenantId,
      undefined,
      accountTypes && accountTypes.map((type) => `TYPE=="${type}"`).join("||")
    );
    return (accountCodesResponse.body.accounts || []).filter(
      (accountCode) => accountCode.taxType !== "NONE"
    );
  } catch (e: any) {
    console.log(e);
    console.log(e.response.statusCode);
    console.log(e.body);
    throw e;
  }
};
