import { Invoice, XeroClient } from "xero-node";

export const getInvoices = async (
  xeroClient: XeroClient,
  lastSyncDate: Date,
  minStartDate: Date
): Promise<Invoice[]> => {
  try {
    const whereFilter = `(FullyPaidOnDate >= DateTime(2021, 01, 01) || UpdatedDateUTC >= DateTime(2021, 01, 01)) && (Type=="ACCPAY")`;

    const xeroInvoicesResponse = await xeroClient.accountingApi.getInvoices(
      xeroClient.tenants[0].tenantId,
      undefined,
      whereFilter,
      "Date ASC", //  order
      undefined, // Ids
      undefined, // invoice numbers
      undefined, // Contact ids
      ["PAID"] // Statuses
    );

    return xeroInvoicesResponse.body.invoices!;
  } catch (e: any) {
    console.log(e);
    console.log(e.response.statusCode);
    console.log(e.body);
    throw e;
  }
};

export const getInvoice = async (
  xeroClient: XeroClient,
  invoiceId: string
): Promise<Invoice> => {
  try {
    const invoice = await xeroClient.accountingApi.getInvoice(
      xeroClient.tenants[0].tenantId,
      invoiceId
    );

    return invoice?.body?.invoices![0];
  } catch (e: any) {
    console.log(e);
    console.log(e.response.statusCode);
    console.log(e.body);
    throw e;
  }
};
