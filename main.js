import * as line from "@line/bot-sdk";
import express from "express";
import process from "node:process";
import axios from "axios";

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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});

//register tally form
app.use("/register", express.static("register"));

app.get("/test", (req, res) => {
  axios({
    method: "get",
    url:
      "https://script.google.com/macros/s/AKfycbze4nXM_U1ol6s0lt4nF6ZQjIoL45x0DuKS-y9Q44CNk2cPgQnieaYNQl_bL2VVYR2u/exec",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((result) => {
      res.send(result.data);
    })
    .catch((error) => {
      console.log(error);
    });
});

app.get("/tally", () => {
  fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      "to": "U60a46a396e1df9b83a7167c51180e252",
      "messages": [
        {
          "type": "text",
          "text": "Tally hook (GET)",
        },
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
  if (
    event.postback.data !== "rm_main_quests" ||
    event.postback.data !== "rm_quest_back"
  ) {
    fetch("https://api.line.me/v2/bot/chat/loading/start", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        "chatId": event.source.userId,
        "loadingSeconds": 5,
      }),
    });
  }

  if (
    event.postback.data == "rm_main_quests" ||
    event.postback.data == "rm_quest_back"
  ) {
    return client.pushMessage({
      to: event.source.userId,
      messages: [
        { type: "text", text: event.postback.data },
      ],
    });
  }
}
