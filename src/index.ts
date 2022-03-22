import * as dotenv from "dotenv";
import { buildAndAuthXeroClient } from "./xero-authenticate.js";
import { getInvoices, getInvoice } from "./xero-invoices.js";
import { getTransactions } from "./xero-transactions.js";

dotenv.config();

const xeroClient = await buildAndAuthXeroClient();

const invoices = await getInvoices(
  xeroClient,
  new Date("2021-01-01"),
  new Date("2021-01-01")
);
console.log(invoices.map((i) => i.invoiceID + " " + i.invoiceNumber));
console.log(invoices.length);

// const notFetchedInvoice = await getInvoice(
//   xeroClient,
//   "96145b5f-a34b-4b93-bc5d-0d8c2d08eb23"
// );
// const fetchedInvoice = await getInvoice(
//   xeroClient,
//   "22ba8536-cb53-47f1-bfe8-8a17d00791ed"
// );

// console.log("Finished fetching");
// console.log("Not fetched invoice:");
// console.log(notFetchedInvoice);
// console.log("Fetched invoice:");
// console.log(fetchedInvoice);
