# xero-api-testing

## Install

`yarn install`

## Usage

To fill your Xero account with data:
`yarn run seed`

To play with the API:
`yarn run index`

## Auth

When you first run any script, if you are not authenticated, it will redirect you the xero auth page, when you complete the authorization flow, then run the following script pasting the url you have been redirected to.

The url should be something like `http://localhost:3000/api/xero/callback?code=8a3e....`

`yarn run authCallback CALLBACK_URL`

This will create the file `tokenSet.json` where it will keep the credentials and use them to refresh the token