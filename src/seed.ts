import * as fs from "fs";
import * as dotenv from "dotenv";

import {
  Account,
  BankTransaction,
  Contact,
  CurrencyCode,
  Invoice,
} from "xero-node";
import { buildAndAuthXeroClient } from "./xero-authenticate.js";
import { createContacts, getContacts } from "./xero-contacts.js";
import { seedInvoices, seedTransactions } from "./xero-seed.js";
import { getBankAccount } from "./xero-bank-accounts.js";

dotenv.config();

const xeroClient = await buildAndAuthXeroClient();

const contacts: Contact[] = await getContacts(xeroClient);
const bankAccount = await getBankAccount(xeroClient);

const transactions = await parseBankTransactions(
  "./seed-data/bank-statements.csv",
  contacts,
  bankAccount
);
await seedTransactions(xeroClient, transactions);

const invoices = await parseInvoices("./seed-data/invoices.csv", contacts);
await seedInvoices(xeroClient, invoices, bankAccount);

async function parseInvoices(
  invoicesFile: string,
  contacts: Contact[]
): Promise<Invoice[]> {
  var dataFile = fs.readFileSync(invoicesFile, "utf8");
  const data = dataFile.split("\r\n").slice(1);

  await createMissingContacts(
    data.map((dataLine) => dataLine.split(",")[0]),
    contacts
  );

  const invoices: Invoice[] = data.map((dataLine) => {
    const invoiceRawData = dataLine.split(",");

    const date = new Date(invoiceRawData[2]).toUTCString();
    const amount = Number.parseFloat(invoiceRawData[3]);

    const newInvoice: Invoice = {
      type: Invoice.TypeEnum.ACCPAY,
      status: Invoice.StatusEnum.AUTHORISED,
      currencyCode: CurrencyCode.GBP,
      contact: findContactByName(contacts, invoiceRawData[0]),
      invoiceNumber: invoiceRawData[1],
      date: date,
      dueDate: date,
      fullyPaidOnDate: date,
      total: amount,
      lineItems: [
        {
          description: invoiceRawData[4],
          quantity: 1,
          accountCode: invoiceRawData[5],
          lineAmount: amount,
        },
      ],
      payments: [
        {
          amount: amount,
          date: date,
        },
      ],
    };
    return newInvoice;
  });
  return invoices;
}

async function parseBankTransactions(
  bankTransactionsFile: string,
  contacts: Contact[],
  bankAccount: Account
): Promise<BankTransaction[]> {
  var dataFile = fs.readFileSync(bankTransactionsFile, "utf8");
  const data = dataFile.split("\r\n").slice(1);

  await createMissingContacts(
    data.map((dataLine) => dataLine.split(",")[0]),
    contacts
  );

  const bankTransactions: BankTransaction[] = data.map((dataLine) => {
    const transactionRawData = dataLine.split(",");
    const newTransaction: BankTransaction = {
      date: new Date(transactionRawData[1]).toISOString(),
      total: Number.parseFloat(transactionRawData[2]),
      contact: findContactByName(contacts, transactionRawData[0]),
      reference: transactionRawData[3],
      type: BankTransaction.TypeEnum.SPEND,
      status: BankTransaction.StatusEnum.AUTHORISED,
      isReconciled: true,
      lineItems: [
        {
          quantity: 1.0,
          unitAmount: Number.parseFloat(transactionRawData[2]),
          accountCode: transactionRawData[4],
        },
      ],
      bankAccount: {
        accountID: bankAccount.accountID,
      },
    };

    return newTransaction;
  });

  return bankTransactions;
}

function findContactByName(
  contacts: Contact[],
  contactName: string
): Contact | undefined {
  const contact = contacts.find((contact) => contact.name === contactName);
  if (contact) {
    return {
      contactID: contact.contactID,
    };
  }
}
async function createMissingContacts(
  contactNames: string[],
  existingContacts: Contact[]
) {
  const missingContactNames = contactNames.filter((contactName) => {
    const existingContact = findContactByName(existingContacts, contactName);
    existingContact === undefined;
  });
  if (missingContactNames && missingContactNames.length > 0) {
    console.log("Create contacts:", missingContactNames);
    const createdContacts = await createContacts(
      xeroClient,
      missingContactNames
    );
    existingContacts.push(...createdContacts);
  }
}
