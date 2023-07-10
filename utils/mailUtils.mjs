export async function replyToEmail(gmail, threadId, subject, from, body) {
  const replyBody = `Dear ${
    from.split(" ")[0]
  },\n\nThank you for your email. This is an automated reply.`;
  const encodedReply = Buffer.from(replyBody).toString("base64");
  const headers = [
    { name: "To", value: from },
    { name: "Subject", value: `Re: ${subject}` },
  ];
  const email = {
    raw: createMessage(headers, encodedReply),
    threadId: threadId,
    labelIds: ["INBOX", "SENT", "UNREAD", "REPLIED", "AutoReply"],
  };

  gmail.users.messages.send(
    {
      userId: "me",
      resource: email,
      labelIds:['AutoReply']
    },
    (err, res) => {
      if (err) return console.log("The API returned an error:", err.message);

      console.log("Reply sent successfully!");
    }
  );
}

// Function to check if a thread has previous replies
export async function hasPreviousReplies(gmail, threadId) {
  const response = await gmail.users.threads.get({
    userId: "me",
    id: threadId,
  });

  const thread = response.data;
  const history = thread.history;

  // Check if the thread has any previous messages
  return history && history.length > 1;
}

export const getMailDetail = (headers, email) => {
  const subject = getHeaderValue(headers, "Subject");
  const from = getHeaderValue(headers, "From");
  const body = getEmailBody(email);

  return {
    subject,
    from,
    body,
  };
};

function createMessage(headers, body) {
  const emailLines = [];

  headers.forEach((header) => {
    emailLines.push(`${header.name}: ${header.value}`);
  });

  emailLines.push("\r\n" + body);

  return Buffer.from(emailLines.join("\r\n")).toString("base64");
}

function getHeaderValue(headers, name) {
  const header = headers.find((header) => header.name === name);
  return header ? header.value : "";
}

function getEmailBody(email) {
  const parts = email.payload.parts;
  if (parts && parts.length) {
    const body = parts.filter((part) => part.mimeType === "text/plain");
    if (body && body.length)
      return Buffer.from(body[0].body.data, "base64").toString();
  }
  return "";
}

// export default getMailDetail;
