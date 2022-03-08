import { XeroClient } from "xero-node";
import fs from "fs";

import dotenv from "dotenv";

const callbackURL = process.argv[2];
if (!callbackURL) {
  throw new Error("Pass the callback URL as argument");
}

dotenv.config();

const xeroClient = new XeroClient({
  clientId: process.env.XERO_CLIENT_ID,
  clientSecret: process.env.XERO_CLIENT_SECRET,
  redirectUris: [`http://localhost:3000/api/xero/callback`],
  scopes: process.env.XERO_SCOPES.split(" "),
});

const tokenSet = await xeroClient.apiCallback(callbackURL);

const jsonString = JSON.stringify(tokenSet);
fs.writeFile("./tokenSet.json", jsonString, (err) => {
  if (err) {
    console.log("Error writing file", err);
  } else {
    console.log("Successfully wrote token set");
  }
});
