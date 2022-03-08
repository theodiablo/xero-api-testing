export const getTransactions = async (xeroClient) => {
  try {
    const lastSyncDate = new Date("2021-03-01");
    const minStartDate = new Date("2022-02-01");
    const whereFilter = `Date >= DateTime(${minStartDate.getUTCFullYear()}, ${
      minStartDate.getUTCMonth() + 1
    }, ${minStartDate.getUTCDate()}, ${minStartDate.getUTCHours()}, 0, 0) AND Type=="SPEND"`;

    const xeroTransactionsResponse =
      await xeroClient.accountingApi.getBankTransactions(
        "2fd04858-d720-457f-878c-7bb30eff3bef",
        lastSyncDate,
        whereFilter,
        "Date ASC"
      );

    return xeroTransactionsResponse.body.bankTransactions;
  } catch (e) {
    console.log(e);
    console.log(e.response.statusCode);
    console.log(e.body);
  }
};
