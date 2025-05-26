import * as line from '@line/bot-sdk';
import express from 'express';

const config = {
  channelSecret: Deno.env.get("CHANNEL_SECRET")
};

const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: Deno.env.get("CHANNEL_ACCESS_TOKEN")
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