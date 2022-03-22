import * as fs from "fs";
import * as child_process from "child_process";
import { XeroClient } from "xero-node";

const tokenFile = "./tokenSet.json";

export async function buildAndAuthXeroClient() {
  const xeroClient = new XeroClient({
    clientId: process.env.XERO_CLIENT_ID!,
    clientSecret: process.env.XERO_CLIENT_SECRET!,
    redirectUris: [`http://localhost:3000/api/xero/callback`],
    scopes: process.env.XERO_SCOPES!.split(" "),
  });

  if (!fs.existsSync(tokenFile)) {
    fs.writeFileSync(tokenFile, "{}");
  }
  const rawdata: any = fs.readFileSync(tokenFile);
  let tokenSet = JSON.parse(rawdata);

  if (!tokenSet || !tokenSet.refresh_token) {
    console.log("No token set created");
    const url = `https://login.xero.com/identity/connect/authorize?response_type=code&client_id=${process.env.XERO_CLIENT_ID}&redirect_uri=http://localhost:3000/api/xero/callback&scope=${process.env.XERO_SCOPES}`;

    await child_process.exec(
      process.platform.replace("darwin", "").replace(/win32|linux/, "xdg-") +
        `open "${url}"`
    );
    throw new Error(
      `No tokenSet found. Please run 'node authCallback <callbackUrl>' See README.md for more info.`
    );
  }

  if (tokenSet.expires_at < new Date().getTime() / 1000) {
    console.log("Token expired");
    tokenSet = await getTokenSetFromRefreshToken(
      tokenSet.refresh_token,
      xeroClient
    );
  }

  xeroClient.setTokenSet(tokenSet);

  //  Update the tenants so they are available for sending as part of the payload to Xero
  await xeroClient.updateTenants();

  return xeroClient;
}

async function getTokenSetFromRefreshToken(
  refreshToken: string,
  xeroClient: XeroClient
) {
  console.log("Update tokens");
  const tokenSet = await xeroClient.refreshWithRefreshToken(
    process.env.XERO_CLIENT_ID,
    process.env.XERO_CLIENT_SECRET,
    refreshToken
  );
  const jsonString = JSON.stringify(tokenSet);
  fs.writeFile(tokenFile, jsonString, (err) => {
    if (err) {
      console.log("Error writing file", err);
    } else {
      console.log("Successfully wrote token set");
    }
  });
  return tokenSet;
}
