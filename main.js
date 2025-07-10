import * as line from "@line/bot-sdk";
import express from "express";
import process from "node:process";
import axios from "axios";
import { userInfo } from "node:os";

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

async function handleEvent(event) {
  //retrieve user profile
  const userProfile = await axios.get(
    "https://api.line.me/v2/bot/profile/" + event.source.userId,
    {
      headers: headers,
    },
  );
  //start
  if (
    event.postback.data !== "rm_main_quests" &&
    event.postback.data !== "rm_quest_back"
  ) {
    axios.post("https://api.line.me/v2/bot/chat/loading/start", {
      "chatId": event.source.userId,
      "loadingSeconds": 10,
    }, {
      headers: headers,
    })
      .then(() => {
        if (!checkRegistration(event.source.userId)) {
          return client.pushMessage({
            "to": event.source.userId,
            "messages": [
              {
                "type": "flex",
                "altText": "Please register",
                "contents": {
                  "type": "bubble",
                  "size": "deca",
                  "header": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                      {
                        "type": "image",
                        "url": userProfile.data.pictureUrl,
                        "size": "xs",
                      },
                      {
                        "type": "text",
                        "text": "Hi, " + userProfile.data.displayName,
                        "color": "#FFFFFF",
                      },
                      {
                        "type": "text",
                        "text": "Click to register",
                        "color": "#FFFFFF",
                        "weight": "regular",
                        "decoration": "underline",
                      },
                    ],
                    "backgroundColor": "#354c73",
                    "alignItems": "center",
                  },
                },
              },
            ],
          });
        }
      })
      .catch((error) => console.error(error));
  }
}

function checkRegistration(userId) {
  let isRegistered = false;
  axios.get(
    "https://script.google.com/macros/s/AKfycbz8bl2Tk1Wq9EPjbSQIjB-tZ_4cFDmZ_lOSlUZrPZZaw5vZbvk8XESKoj5B4BA4Zdnb/exec",
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  )
    .then((result) => {
      console.log(typeof result);
      const data = JSON.parse(result);
      console.log(typeof data);
      for (let i = 0; i < result.data.length; i++) {
        if (result.data[i][0] === userId) {
          isRegistered = true;
          break;
        }
      }
    })
    .catch((error) => console.error(error));
  console.log("isRegistered value : " + isRegistered);
  return isRegistered;
}
