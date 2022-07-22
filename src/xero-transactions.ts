import { BankTransaction, XeroClient } from "xero-node";

export const createTransactions = async (
  xeroClient: XeroClient,
  bankTransactions: BankTransaction[]
): Promise<BankTransaction[]> => {
  try {
    const transactionsResult = [];
    // Split transactions into batches of 100 to avoid rate limiting
    for (let i = 0; i < bankTransactions.length; i += 100) {
      const xeroTransactionsResponse =
        await xeroClient.accountingApi.createBankTransactions(
          xeroClient.tenants[0].tenantId,
          {
            bankTransactions: bankTransactions.slice(i, i + 100),
          }
        );
      const createdTransactions =
        xeroTransactionsResponse.body.bankTransactions || [];
      transactionsResult.push(...createdTransactions);
      console.log(
        `Created ${transactionsResult.length}/${bankTransactions.length} transactions`
      );
    }

    return transactionsResult;
  } catch (e: any) {
    console.log(e.body);
    console.log(e.response.body);
    console.log(e.response.body.Elements.map((el: any) => el.ValidationErrors));
    throw e;
  }
};

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
