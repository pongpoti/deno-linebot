import * as line from "@line/bot-sdk";
import express from "express";
import process from "node:process";
import qs from "qs";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import path from "path";

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

app.use("/regis", express.static("regis"));

app.get("/", (_, res) => {
  res.redirect(
    "https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=2007211330&scope=profile%20openid&redirect_uri=https%3A%2F%2Fpongsit-linebot.deno.dev%2Fcallback&state=12345abcde",
  );
});

app.get("/callback", (req, res) => {
  res.redirect("https://pongsit-linebot.deno.dev/auth?code=" + req.query.code);
});

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

app.get("/auth", (req, res) => {
  const code = req.query.code;
  axios({
    method: "post",
    url: "https://api.line.me/oauth2/v2.1/token",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: qs.stringify({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: "https://pongsit-linebot.deno.dev/callback",
      client_id: "2007211330",
      client_secret: "ea3204e6ff3f9a8365c2a20de8a92568",
    }),
  })
    .then((result) => {
      const decoded = jwtDecode(result.data.id_token);
      res.send(decoded.sub);
    })
    .catch((error) => {
      console.log(error);
    });
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
  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null);
  }

  const echo = { type: "text", text: event.message.text };

  return client.replyMessage({
    replyToken: event.replyToken,
    messages: [echo],
  });
}


