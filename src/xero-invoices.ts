import { Account, Invoice, XeroClient } from "xero-node";
import { XERO_CONCURRENT_REQUESTS } from "./constants.js";
import { chunk } from "./utils.js";

export const createInvoices = async (
  xeroClient: XeroClient,
  invoices: Invoice[],
  account: Account
): Promise<Invoice[]> => {
  const invoicessResult: Invoice[] = [];
  // Split invoices into batches of 100 and run them concurrently in Xero
  const invoicesBatches = chunk(invoices, 100);

  while (invoicesBatches.length > 0) {
    const currentBatches = invoicesBatches.splice(0, XERO_CONCURRENT_REQUESTS);
    await Promise.all(
      currentBatches.map((batch) =>
        createInvoicesInternal(xeroClient, batch, account).then(
          (createdInvoices) => {
            invoicessResult.push(...createdInvoices);
            console.log(
              `Created ${invoicessResult.length}/${invoices.length} invoices`
            );
          }
        )
      )
    );
  }

  return invoicessResult;
};

const createInvoicesInternal = async (
  xeroClient: XeroClient,
  invoices: Invoice[],
  account: Account
) => {
  const xeroInvoicesResponse = await xeroClient.accountingApi.createInvoices(
    xeroClient.tenants[0].tenantId,
    {
      invoices,
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
        isReconciled: true,
      })),
    }
  );
  return createdInvoices;
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
