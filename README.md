# xero-api-testing

## Install

`yarn install`

## Run 

`node index`

## Auth

When you first run the script, it will redirect you the xero auth page, when you complete the authorization flow, then run the following script pasting the url you have been redirected to.

The url should be something like `http://localhost:3000/api/xero/callback?code=8a3e....`

`node authCallback CALLBACK_URL`

This will create the file `tokenSet.json` where it will keep the credentials and use them to refresh the token