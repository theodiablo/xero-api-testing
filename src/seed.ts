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
  bankAccount
);
await seedTransactions(xeroClient, transactions);

const invoices = await parseInvoices("./seed-data/invoices.csv");
await seedInvoices(xeroClient, invoices, bankAccount);

async function parseInvoices(invoicesFile: string): Promise<Invoice[]> {
  var dataFile = fs.readFileSync(invoicesFile, "utf8");
  const data = dataFile.split("\r\n").slice(1);

  await createMissingContacts(data.map((dataLine) => dataLine.split(",")[0]));

  const invoices: Invoice[] = data
    .map((dataLine) => {
      const invoiceRawData = dataLine.split(",");
      if (invoiceRawData.length > 1) {
        const date = new Date(invoiceRawData[2]).toISOString();
        const amount = Number.parseFloat(invoiceRawData[3]);

        const newInvoice: Invoice = {
          type: Invoice.TypeEnum.ACCPAY,
          status: Invoice.StatusEnum.AUTHORISED,
          currencyCode: CurrencyCode.GBP,
          contact: findContactByName(invoiceRawData[0]),
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
      }
      return null;
    })
    .filter((invoice) => invoice !== null) as Invoice[];
  return invoices;
}

async function parseBankTransactions(
  bankTransactionsFile: string,
  bankAccount: Account
): Promise<BankTransaction[]> {
  var dataFile = fs.readFileSync(bankTransactionsFile, "utf8");
  const data = dataFile.split("\r\n").slice(1);

  await createMissingContacts(data.map((dataLine) => dataLine.split(",")[0]));

  const bankTransactions: BankTransaction[] = data.map((dataLine) => {
    const transactionRawData = dataLine.split(",");
    const newTransaction: BankTransaction = {
      date: new Date(transactionRawData[1]).toISOString(),
      total: Number.parseFloat(transactionRawData[2]),
      contact: findContactByName(transactionRawData[0]),
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

function findContactByName(contactName: string): Contact | undefined {
  const contact = contacts.find((contact) => contact.name === contactName);
  if (contact) {
    return contact;
  } else {
    console.log(`Could not find contact ${contactName}`);
    return undefined;
  }
}
async function createMissingContacts(contactNames: string[]) {
  const missingContactNames = contactNames.filter((contactName) => {
    const existingContact = findContactByName(contactName);
    return existingContact === undefined && contactName.length > 0;
  });
  if (missingContactNames && missingContactNames.length > 0) {
    const batchedArrays: Array<Array<string>> = [];
    const batchSize = 25;
    for (let i = 0, len = missingContactNames.length; i < len; i += batchSize) {
      batchedArrays.push(missingContactNames.slice(i, i + batchSize));
    }

    for (const contactNames of batchedArrays) {
      console.log("Create contacts:", contactNames);
      const createdContacts = await createContacts(xeroClient, contactNames);
      contacts.push(...createdContacts);
    }
    console.log("Contacts created");
  }
}
