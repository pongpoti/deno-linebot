import * as line from '@line/bot-sdk';
import express from 'express';
import "jsr:@std/dotenv/load";

//Deno.env.set("CHANNEL_SECRET", "c02f0c8c17e4b0f607b31e3ad1c3f529");
//Deno.env.set("CHANNEL_ACCESS_TOKEN", "qmdRNYKVnChOLXdfdhFn159TMJtURVZ1wpx2cp9EKLCTv2NWq14J+OFjtOWObAKVPmY8+q16zF14O55JXI83c9lBEtFgV31unhTx4lDpQPptfzK+G8ANFSkHA08qx82xnL8gmEyPKiRoZVhjVrBcOQdB04t89/1O/w1cDnyilFU=");

console.log(Deno.env.CHANNEL_SECRET);
console.log(Deno.env.CHANNEL_ACCESS_TOKEN);


const config = {
  channelSecret: Deno.env.CHANNEL_SECRET
};

const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: Deno.env.CHANNEL_ACCESS_TOKEN
});

const app = express();

app.post('/callback', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const echo = { type: 'text', text: event.message.text };

  return client.replyMessage({
    replyToken: event.replyToken,
    messages: [echo],
  });
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});