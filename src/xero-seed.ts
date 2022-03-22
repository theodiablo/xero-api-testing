import {
  Account,
  BankTransaction,
  BankTransactions,
  Invoice,
  Invoices,
  XeroClient,
} from "xero-node";

export const seedInvoices = async (
  xeroClient: XeroClient,
  invoices: Invoice[],
  account: Account
) => {
  try {
    const xeroInvoicesResponse = await xeroClient.accountingApi.createInvoices(
      xeroClient.tenants[0].tenantId,
      {
        invoices,
      }
    );

    const createdInvoices = xeroInvoicesResponse.body.invoices;

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

    return createdInvoices;
  } catch (e: any) {
    console.log(e.body);
    console.log(e.response.body);
    console.log(e.response.body.Elements.map((el: any) => el.ValidationErrors));
  }
};

export const seedTransactions = async (
  xeroClient: XeroClient,
  bankTransactions: BankTransaction[]
) => {
  try {
    const xeroInvoicesResponse =
      await xeroClient.accountingApi.createBankTransactions(
        xeroClient.tenants[0].tenantId,
        {
          bankTransactions,
        }
      );

    return xeroInvoicesResponse.body.bankTransactions;
  } catch (e: any) {
    console.log(e.body);
    console.log(e.response.body);
    console.log(e.response.body.Elements.map((el: any) => el.ValidationErrors));
  }
};
