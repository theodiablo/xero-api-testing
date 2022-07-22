import { Account, Invoice, XeroClient } from "xero-node";

export const createInvoices = async (
  xeroClient: XeroClient,
  invoices: Invoice[],
  account: Account
): Promise<Invoice[]> => {
  try {
    const invoicessResult: Invoice[] = [];
    // Split invoices into batches of 100 to avoid rate limiting
    for (let i = 0; i < invoices.length; i += 100) {
      const xeroInvoicesResponse =
        await xeroClient.accountingApi.createInvoices(
          xeroClient.tenants[0].tenantId,
          {
            invoices: invoices.slice(i, i + 100),
          }
        );
      const createdInvoices = xeroInvoicesResponse.body.invoices || [];
      // Pay invoices
      await xeroClient.accountingApi.createPayments(
        xeroClient.tenants[0].tenantId,
        {
          payments: createdInvoices!.map((invoice) => ({
            invoice,
            account,
            amount: invoice.amountDue,
            date: invoice.date,
          })),
        }
      );
      invoicessResult.push(...createdInvoices);
      console.log(
        `Created ${invoicessResult.length}/${invoices.length} invoices`
      );
    }

    return invoicessResult;
  } catch (e: any) {
    console.log(e.body);
    console.log(e.response.body);
    console.log(e.response.body.Elements.map((el: any) => el.ValidationErrors));
    throw e;
  }
};

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
