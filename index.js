import dotenv from "dotenv";
import { buildAndAuthXeroClient } from "./xero-authenticate.js";
import { getTransactions } from "./xero-transactions.js";

dotenv.config();

const xeroClient = await buildAndAuthXeroClient();

const transactions = await getTransactions(xeroClient);

console.log("Finished fetching");
console.log(
  transactions.map((t) => {
    return {
      date: t.date,
      name: t.contact.name,
      lastUpdate: t.updatedDateUTC,
    };
  })
);
