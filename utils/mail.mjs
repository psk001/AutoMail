import { google } from "googleapis";
import gmailClient from "../exports/gmailClient.mjs";
const gmail = google.gmail({ version: "v1", auth: gmailClient });

import {
  getMailDetail,
  hasPreviousReplies,
  replyToEmail,
} from "./mailUtils.mjs";

// Function to process incoming emails
async function processIncomingEmails() {
  const response = await gmail.users.messages.list({   // get all unread emails
    userId: "me",
    labelIds: ['INBOX'],
    q: "is:unread",
  });

  const messages = response.data.messages;

  if (messages && messages.length > 0) {   // check if there are unread messages
    console.log('unreplied threads: ', messages.length)
    for (const message of messages) {
      const threadId = message.threadId;   

      const hasReplies = await hasPreviousReplies(gmail, threadId);    // check if the thread of given email has any replies

      if (!hasReplies) {
        // Reply to the email if it is a new thread
        console.log(threadId, 'has never been replied')
        const messageResponse = await gmail.users.messages.get({
          userId: "me",
          id: message.id,
          labelIds: ["INBOX"],
          q: "in:inbox is:unread has:nouserlabels -{label:replied}",
        });

        const email = messageResponse.data;
        const headers = email.payload.headers;

        const { from, subject, body } = await getMailDetail(headers, email);

        await replyToEmail(gmail, threadId, subject, from, body);
      }
    }
  }
}

export default processIncomingEmails;
