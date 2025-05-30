import * as line from "@line/bot-sdk";
import express from "express";
import process from "node:process";

const headers = {
  "Content-Type": "application/json",
  "Authorization":
    "Bearer qmdRNYKVnChOLXdfdhFn159TMJtURVZ1wpx2cp9EKLCTv2NWq14J+OFjtOWObAKVPmY8+q16zF14O55JXI83c9lBEtFgV31unhTx4lDpQPptfzK+G8ANFSkHA08qx82xnL8gmEyPKiRoZVhjVrBcOQdB04t89/1O/w1cDnyilFU=",
};

const config = {
  channelSecret: Deno.env.get("CHANNEL_SECRET"),
};

const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: Deno.env.get("CHANNEL_ACCESS_TOKEN"),
});

const app = express();

app.get("/access", (req, res) => {
  res.send(req.query);
});

app.post("/tally", (req, res) => {

});

app.get("/tally", (reg, res) => {
  fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      "to": "U60a46a396e1df9b83a7167c51180e252",
      "messages": [
        {
          "type": "text",
          "text": "Tally hook (GET)"
        }
      ],
    }),
  });  
});

app.post("/line", line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null);
  }

  const echo = { type: "text", text: event.message.text };

  return client.replyMessage({
    replyToken: event.replyToken,
    messages: [echo],
  });
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
