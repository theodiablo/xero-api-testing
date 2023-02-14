import * as dotenv from "dotenv";
import { buildAndAuthXeroClient } from "./xero-authenticate.js";

dotenv.config();

const xeroClient = await buildAndAuthXeroClient();

const invoices = await xeroClient.accountingApi.getInvoices(
  xeroClient.tenants[0].tenantId,
  new Date("2023-01-18T15:58:18.781Z"),
  'TYPE="ACCPAY"&&Date >= DateTime(2022, 6, 14) && Date <= DateTime(2023, 1, 18)',
  undefined,
  undefined,
  undefined,
  undefined
);

console.log("invoices", invoices.body.invoices);
