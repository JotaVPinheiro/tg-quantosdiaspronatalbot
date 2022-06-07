require("dotenv").config();
const axios = require("axios");
const express = require("express");
const app = express();

const { BOT_TOKEN, SERVER_URL, SERVER_PORT } = process.env;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const URI = `/webhook/${BOT_TOKEN}`;
const WEBHOOK_URL = SERVER_URL + URI;

const updateRegex = /\/update$|\/update@quantosdiaspronatalbot$/;

const init = async () => {
  const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`);
  console.log(res.data);
};

app.use(express.json());

app.post(URI, async (req, res) => {
  const data = req.body;
  console.log(data);

  if (data.message === undefined) {
    return res.send();
  }

  if (updateRegex.test(data.message.text)) {
    if (data.message.chat.type === "supergroup") {
      try {
        await axios.post(`${TELEGRAM_API}/setChatDescription`, {
          chat_id: data.message.chat.id,
          description: "Descrição atualizada",
        });
      } catch (error) {
        console.error(error);
      }
    }
  }

  return res.send();
});

app.listen(SERVER_PORT || 5000, async () => {
  console.log(`Server running on port ${SERVER_PORT}`);
  await init();
});
