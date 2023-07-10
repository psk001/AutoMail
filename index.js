// require('dotenv').config();

import processIncomingEmails from "./utils/mail.mjs";

async function processEmail() {
  const minTimeout = 45 * 1000; // Convert seconds to milliseconds
  const maxTimeout = 120 * 1000; // Convert seconds to milliseconds

  const timeout =
    Math.floor(Math.random() * (maxTimeout - minTimeout + 1)) + minTimeout;

  setTimeout(await processIncomingEmails(), timeout);
}

// Call the initial function to start the random calls
await processEmail();
