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

app.get("/test", (_, res) => {
  axios.get(
    "https://script.google.com/macros/s/AKfycbz8bl2Tk1Wq9EPjbSQIjB-tZ_4cFDmZ_lOSlUZrPZZaw5vZbvk8XESKoj5B4BA4Zdnb/exec",
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  )
    .then((result) => res.send(result.data))
    .catch((error) => console.error(error));
});

app.get("/tally", () => {
  axios.post("https://api.line.me/v2/bot/message/push", {
    "to": "U60a46a396e1df9b83a7167c51180e252",
    "messages": [
      {
        "type": "text",
        "text": "Tally hook (GET)",
      },
    ],
  }, {
    headers: headers,
  })
    .then((result) => console.log(result))
    .catch((error) => console.error(error));
});

app.post("/line", line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((error) => {
      console.error(error);
      res.status(500).end();
    });
});

function handleEvent(event) {
  if (
    event.postback.data == "rm_main_quests" ||
    event.postback.data == "rm_quest_back"
    // deno-lint-ignore no-empty
  ) { } else {
    axios.post("https://api.line.me/v2/bot/chat/loading/start", {
      "chatId": event.source.userId,
      "loadingSeconds": 5,
    }, {
      headers: headers,
    })
      .then((result) => console.log(result))
      .catch((error) => console.error(error));
  }

  if (event.postback.data !== "") {
    if (checkRegistration(event.source.userId)) {
      return client.pushMessage({
        to: event.source.userId,
        messages: [
          { type: "text", text: event.postback.data },
        ],
      });
    }
  }

}

function checkRegistration(userId) {
  let isRegistered = false;
  let databaseArray = [];
  axios.get(
    "https://script.google.com/macros/s/AKfycbz8bl2Tk1Wq9EPjbSQIjB-tZ_4cFDmZ_lOSlUZrPZZaw5vZbvk8XESKoj5B4BA4Zdnb/exec",
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  )
    .then((result) => {
      databaseArray = JSON.parse(result.data);
    })
    .catch((error) => console.error(error));

  for (i = 0; i < databaseArray.length; i++) {
    if (userId == databaseArray[i][0]) {
      isRegistered = true;
      break;
    }
  }

  if (!isRegistered) {
    client.pushMessage({
      "to": userId,
      "messages": [
        {
          "type": "flex",
          "altText": "Please register",
          "contents": {
            "type": "bubble",
            "size": "micro",
            "body": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "box",
                  "layout": "vertical",
                  "contents": [
                    {
                      "type": "text",
                      "text": "click to register",
                      "weight": "bold",
                      "align": "center",
                      "color": "#354c73",
                      "size": "md"
                    }
                  ],
                  "backgroundColor": "#FFFFFF",
                  "height": "35px"
                },
                {
                  "type": "box",
                  "layout": "vertical",
                  "contents": [
                    {
                      "type": "text",
                      "text": "shadow",
                      "color": "#354c73"
                    }
                  ],
                  "backgroundColor": "#354c73",
                  "height": "6px"
                }
              ],
              "borderWidth": "semi-bold",
              "borderColor": "#354c73",
              "cornerRadius": "md",
              "action": {
                "type": "uri",
                "label": "action",
                "uri": "https://liff.line.me/2007511559-yMnLXN2D"
              },
              "paddingBottom": "none",
              "paddingStart": "none",
              "paddingEnd": "none"
            }
          }
        }
      ]
    })
  }

  return isRegistered;
}
