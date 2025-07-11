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
//test by userId
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
//main
app.post("/line", line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((error) => console.error(error));
});

async function handleEvent(event) {
  if (
    event.postback.data !== "rm_main_quests" &&
    event.postback.data !== "rm_quest_back"
  ) {
    loadAnimation(event.source.userId);
    const database = await getDatabase();
    const userProfile = await getUserProfile(event.source.userId);

    if (checkRegistration(database, userProfile)) {
      if (event.postback.data === "rm_main_info") {
        postResearchStatus(database, userProfile);
      }
    }
  }
}

function loadAnimation(userId) {
  axios.post(
    "https://api.line.me/v2/bot/chat/loading/start",
    {
      "chatId": userId,
      "loadingSeconds": 5,
    },
    {
      headers: headers,
    },
  )
    .then((result) => console.log(result.status))
    .catch((error) => console.error(error));
}

async function getDatabase() {
  const result = await axios.get(
    "https://script.google.com/macros/s/AKfycbyKitnoIaN7ETfBVd-sd-J3lV_ntqRleHMDXOkJ1h0FpoqweaMyToqHYBXTu_BnGwbi/exec",
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  return result.data;
}

async function getUserProfile(userId) {
  const result = await axios.get(
    "https://api.line.me/v2/bot/profile/" + userId,
    {
      headers: headers,
    },
  );
  return result.data;
}

function checkRegistration(database, userProfile) {
  let isRegistered = false;
  for (let i = 0; i < database.length; i++) {
    if (database[i][0] === userProfile.userId) {
      isRegistered = true;
      break;
    }
  }
  if (!isRegistered) {
    client.pushMessage({
      "to": userProfile.userId,
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
                  "url": userProfile.pictureUrl,
                  "size": "xs",
                },
                {
                  "type": "text",
                  "text": "Hi, " + userProfile.displayName,
                  "color": "#FFFFFF",
                },
                {
                  "type": "text",
                  "text": "Click to register",
                  "color": "#FFFFFF",
                  "weight": "regular",
                  "decoration": "underline",
                  "action": {
                    "type": "uri",
                    "label": "action",
                    "uri": "https://liff.line.me/2007511559-yMnLXN2D",
                  },
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
  return isRegistered;
}

function postResearchStatus(database, userProfile) {
  for (let i = 0; i < database.length; i++) {
    if (database[i][0] === userProfile.userId) {
      client.pushMessage({
        "to": userProfile.userId,
        "messages": [
          {
            "type": "flex",
            "altText": "Research status",
            "contents": {
              "type": "bubble",
              "header": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                  {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                      {
                        "type": "text",
                        "text": "ระบบข้อมูลการฝึกอบรม",
                        "color": "#ffffff",
                        "align": "center",
                        "size": "lg",
                        "weight": "bold",
                      },
                      {
                        "type": "text",
                        "text": "แพทย์ต่อยอด อนุสาขาอุบัติเหตุ",
                        "color": "#ffffff",
                        "align": "center",
                        "size": "md",
                      },
                    ],
                  },
                ],
                "backgroundColor": "#354c73",
              },
              "hero": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                  {
                    "type": "text",
                    "text": "Personal data",
                    "color": "#FFFFFF",
                    "align": "center",
                  },
                ],
                "paddingAll": "md",
                "backgroundColor": "#5A79BB",
              },
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
                        "text": "ปีการศึกษา 2568",
                        "size": "md",
                        "align": "center",
                      },
                      {
                        "type": "text",
                        "text": "1 กรกฎาคม 2568 - 30 มิถุนายน 2569",
                        "size": "sm",
                        "align": "center",
                      },
                      {
                        "type": "text",
                        "text": "...",
                        "size": "xxs",
                        "color": "#FFFFFF",
                      },
                    ],
                  },
                  {
                    "type": "separator",
                  },
                  {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                      {
                        "type": "text",
                        "text": "...",
                        "size": "xxs",
                        "color": "#FFFFFF",
                      },
                      {
                        "type": "text",
                        "text": "ข้อมูลพื้นฐาน",
                        "weight": "bold",
                        "size": "md",
                      },
                      {
                        "type": "text",
                        "text": database[i][1] + " (" + database[i][2] + ")",
                        "size": "sm",
                      },
                      {
                        "type": "text",
                        "text": database[i][3] + " , M.D.",
                        "size": "sm",
                      },
                      {
                        "type": "text",
                        "text": "ที่อยู่ : " + database[i][4],
                        "size": "sm",
                      },
                      {
                        "type": "text",
                        "text": "เบอร์ติดต่อ : " + database[i][5].slice(1, -1),
                        "size": "sm",
                      },
                      {
                        "type": "text",
                        "text": "...",
                        "size": "xxs",
                        "color": "#FFFFFF",
                      },
                    ],
                  },
                  {
                    "type": "separator",
                  },
                  {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                      {
                        "type": "text",
                        "text": "...",
                        "size": "xxs",
                        "color": "#FFFFFF",
                      },
                      {
                        "type": "text",
                        "text": "แพทย์ประจำบ้าน",
                        "size": "md",
                        "weight": "bold",
                      },
                      {
                        "type": "text",
                        "text": database[i][6],
                        "size": "sm",
                      },
                      {
                        "type": "text",
                        "text": "ปีจบการศึกษา : " + database[i][7].toString(),
                        "size": "sm",
                      },
                      {
                        "type": "text",
                        "text": "...",
                        "size": "xxs",
                        "color": "#FFFFFF",
                      },
                    ],
                  },
                  {
                    "type": "separator",
                  },
                  {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                      {
                        "type": "text",
                        "text": "...",
                        "size": "xxs",
                        "color": "#FFFFFF",
                      },
                      {
                        "type": "text",
                        "text": "การทำงาน",
                        "size": "md",
                        "weight": "bold",
                      },
                      {
                        "type": "text",
                        "text": "ปัจจุบัน : " + database[i][8],
                        "size": "sm",
                      },
                      {
                        "type": "text",
                        "text": "อบรมต่อยอด : " + database[i][9],
                        "size": "sm",
                      },
                      {
                        "type": "text",
                        "text": "หลังจบ : " + database[i][10],
                        "size": "sm",
                      },
                      {
                        "type": "text",
                        "text": "...",
                        "size": "xxs",
                        "color": "#FFFFFF",
                      },
                    ],
                  },
                  {
                    "type": "separator",
                  },
                  {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                      {
                        "type": "text",
                        "text": "...",
                        "size": "xxs",
                        "color": "#FFFFFF",
                      },
                      {
                        "type": "box",
                        "layout": "vertical",
                        "contents": [
                          {
                            "type": "text",
                            "text": "ข้อกำหนดในการสำเร็จการศึกษา",
                            "size": "sm",
                            "align": "center",
                            "color": "#FFFFFF",
                          },
                        ],
                        "backgroundColor": "#5A79BB",
                        "justifyContent": "center",
                        "cornerRadius": "md",
                        "action": {
                          "type": "uri",
                          "label": "action",
                          "uri": "http://linecorp.com/",
                        },
                        "width": "220px",
                        "height": "35px",
                        "borderColor": "#354c73",
                        "borderWidth": "normal",
                      },
                      {
                        "type": "text",
                        "text": "...",
                        "color": "#FFFFFF",
                        "size": "xxs",
                      },
                    ],
                    "alignItems": "center",
                  },
                ],
              },
              "footer": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                  {
                    "type": "text",
                    "text": "Created by : " + userProfile.displayName,
                    "align": "end",
                    "color": "#FFFFFF",
                    "size": "xxs",
                  },
                  {
                    "type": "text",
                    "text": date.getDate().toString() + "-" +
                      (date.getMonth() + 1).toString() + "-" +
                      date.getFullYear().toString() + " || " +
                      date.getUTCHours().toString() + ":" +
                      date.getUTCMinutes().toString(),
                    "align": "end",
                    "color": "#FFFFFF",
                    "size": "xxs",
                  },
                ],
                "backgroundColor": "#354c73",
              },
            },
          },
        ],
      });
      break;
    }
  }
}
