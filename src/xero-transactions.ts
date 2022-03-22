import { BankTransaction, XeroClient } from "xero-node";

export const getTransactions = async (
  xeroClient: XeroClient
): Promise<BankTransaction[]> => {
  try {
    const lastSyncDate = new Date("2021-03-01");
    const minStartDate = new Date("2022-02-01");
    const whereFilter = `Date >= DateTime(${minStartDate.getUTCFullYear()}, ${
      minStartDate.getUTCMonth() + 1
    }, ${minStartDate.getUTCDate()}, ${minStartDate.getUTCHours()}, 0, 0) AND Type=="SPEND"`;

    const xeroTransactionsResponse =
      await xeroClient.accountingApi.getBankTransactions(
        xeroClient.tenants[0].tenantId,
        lastSyncDate,
        whereFilter,
        "Date ASC"
      );

    return xeroTransactionsResponse.body.bankTransactions!;
  } catch (e: any) {
    console.log(e);
    console.log(e.response.statusCode);
    console.log(e.body);
    throw e;
  }
};
