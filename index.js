import dotenv from "dotenv";
import { buildAndAuthXeroClient } from "./xero-authenticate.js";
import { getInvoices } from "./xero-invoices.js";
import { getTransactions } from "./xero-transactions.js";

dotenv.config();

const xeroClient = await buildAndAuthXeroClient();

const invoices = await getInvoices(xeroClient);

console.log("Finished fetching");
console.log(invoices);
