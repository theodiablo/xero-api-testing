export const getInvoices = async (xeroClient) => {
  try {
    const lastSyncDate = new Date("2021-01-01");
    const minStartDate = new Date("2021-01-01");
    const whereFilter = `Date >= DateTime(${minStartDate.getUTCFullYear()}, ${
      minStartDate.getUTCMonth() + 1
    }, ${minStartDate.getUTCDate()}, ${minStartDate.getUTCHours()}, 0, 0) && (Type=="ACCPAY" || Type=="SPEND")`;

    const xeroInvoicesResponse = await xeroClient.accountingApi.getInvoices(
      "2fd04858-d720-457f-878c-7bb30eff3bef",
      lastSyncDate,
      whereFilter,
      "Date ASC" //  order
    );

    return xeroInvoicesResponse.body.invoices;
  } catch (e) {
    console.log(e);
    console.log(e.response.statusCode);
    console.log(e.body);
  }
};
