# xero-api-testing

This small typescript project can be used to:
* Handle OAuth flow to authenticate + refresh token to avoid manually authenticate
* Seed any Xero account with basic data so you have more transactions than the basic ones.

Limitations:
* At the moment, it only handles 1 account.
* You'll have to change the redirect URL manually in the code: `http://localhost:3000/api/xero/callback`
* Not super clean or nicely written. I made this to be quick and dirty

This project is used inside [Ecologi](https://github.com/ecologi/), you are welcome to fork this or contribute if you feel like it could be useful for you.

## Install

Copy the `.env.example` file to `.env` and fill the variables with corresponding values.

Run `yarn install`

## Usage

To fill your Xero account with data:
`yarn seed [amount]`

* `amount`: Number of transactions and invoices to be created. Optional, default 50

## Auth

When you first run any script, if you are not authenticated, it will redirect you the xero auth page, when you complete the authorization flow, then run the following script pasting the url you have been redirected to.

The url should be something like `http://localhost:3000/api/xero/callback?code=8a3e....`

`yarn auth CALLBACK_URL`

This will create the file `tokenSet.json` where it will keep the credentials and use them to refresh the token, then you can run again the `yarn seed` function
