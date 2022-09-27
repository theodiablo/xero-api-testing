import * as dotenv from "dotenv";

import { BankTransaction, CurrencyCode, Invoice } from "xero-node";
import { buildAndAuthXeroClient } from "./xero-authenticate.js";
import { XeroContact } from "./xero-contacts.js";
import { getAccountCodes, getBankAccount } from "./xero-bank-accounts.js";
import { randomDate, randomInt, randomString } from "./utils.js";
import { contactNames } from "./seed-data/contact-names.js";
import { createInvoices } from "./xero-invoices.js";
import { createTransactions } from "./xero-transactions.js";

dotenv.config();

const amountArg = process.argv[2];

const amount = Number.parseInt(amountArg, 10) || 50;

const xeroClient = await buildAndAuthXeroClient();

const xeroContact = new XeroContact(xeroClient);
await xeroContact.init(contactNames);

const bankAccount = await getBankAccount(xeroClient);
const accountCodes = await getAccountCodes(xeroClient);

await generateBankTransactions();
await generateInvoices();

async function generateInvoices(): Promise<Invoice[]> {
  const invoices: Invoice[] = [];

  for (let i = 0; i < amount; i++) {
    const amount = Math.random() * 1000 + 10;
    const invoiceDate = randomDate().toISOString();
    invoices.push({
      type: Invoice.TypeEnum.ACCPAY,
      status: Invoice.StatusEnum.AUTHORISED,
      currencyCode: CurrencyCode.GBP,
      contact: xeroContact.getRandomContact(),
      invoiceNumber: randomString(30),
      date: invoiceDate,
      dueDate: invoiceDate,
      fullyPaidOnDate: invoiceDate,
      total: amount,
      lineItems: [
        {
          description: randomString(20),
          quantity: 1,
          accountCode: accountCodes[randomInt(0, accountCodes.length - 1)].code,
          lineAmount: amount,
        },
      ],
      payments: [
        {
          amount: amount,
          date: invoiceDate,
        },
      ],
    });
  }

  return createInvoices(xeroClient, invoices, bankAccount);
}

async function generateBankTransactions(): Promise<BankTransaction[]> {
  const transactions: BankTransaction[] = [];

  for (let i = 0; i < amount; i++) {
    const amount = Math.random() * 1000 + 10;
    transactions.push({
      date: randomDate().toISOString(),
      total: amount,
      contact: xeroContact.getRandomContact(),
      reference: randomString(30),
      type: BankTransaction.TypeEnum.SPEND,
      status: BankTransaction.StatusEnum.AUTHORISED,
      isReconciled: true,
      lineItems: [
        {
          quantity: 1.0,
          unitAmount: amount,
          accountCode: accountCodes[randomInt(0, accountCodes.length - 1)].code,
        },
      ],
      bankAccount: {
        accountID: bankAccount.accountID,
      },
    });
  }

  return createTransactions(xeroClient, transactions);
}
