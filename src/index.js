require("dotenv").config();
const axios = require("axios");
const express = require("express");
const app = express();

const { BOT_TOKEN, SERVER_URL, PORT } = process.env;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const URI = `/webhook/${BOT_TOKEN}`;
const WEBHOOK_URL = SERVER_URL + URI;

const updateRegex = /\/updatedescription(@quantosdiaspronatalbot)?/;
const updateWithParamsRegex =
  /\/updatedescription(@quantosdiaspronatalbot)? (?=.)/;
const tellRegex = /\/tellme(@quantosdiaspronatalbot)?/;

const init = async () => {
  const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`);
  console.log(res.data);
};

const calcDaysTillChristmas = () => {
  const millisecondsToDays = 1000 * 60 * 60 * 24;
  const today = new Date();
  const thisChristmas = new Date(today.getFullYear(), 11, 25);

  if (today < thisChristmas)
    return Math.ceil((thisChristmas - today) / millisecondsToDays);

  const nextYearChristmas = new Date(today.getFullYear() + 1, 11, 25);
  return Math.ceil((nextYearChristmas - today) / millisecondsToDays);
};

const getChristmasMessage = () => {
  const daysTillChristmas = calcDaysTillChristmas();

  if (daysTillChristmas === 365) return "FELIZ NATAL!";

  if (daysTillChristmas === 1) return "FALTA 1 DIA PARA O NATAL!";

  return `FALTAM ${daysTillChristmas} DIAS PARA O NATAL!`;
};

const sendMessage = async (text, chat_id) => {
  await axios.post(`${TELEGRAM_API}/sendMessage`, {
    chat_id,
    text,
  });
};

const setDescription = async (description, chat_id) => {
  await axios.post(`${TELEGRAM_API}/setChatDescription`, {
    chat_id,
    description,
  });
};

app.use(express.json());

app.post(URI, async (req, res) => {
  const { message } = req.body;
  console.log(req.body);

  if (message === undefined) return res.send();

  if (updateRegex.test(message.text)) {
    try {
      const params = updateWithParamsRegex.test(message.text)
        ? "\n\n" + message.text.replace(updateWithParamsRegex, "")
        : "";

      await setDescription(
        getChristmasMessage() +
          (message.chat.id == process.env.SECRET_ID
            ? process.env.SECRET_DESC
            : params),
        message.chat.id
      );

      await sendMessage("Descrição atualizada!", message.chat.id);
    } catch (error) {
      const { description } = error.response.data;

      if (description === "Bad Request: chat description is not modified") {
        try {
          await sendMessage("A descrição já está atualizada!", message.chat.id);
        } catch (error) {
          console.error(error);
        }
      }

      console.error(error);
    }
  }

  if (tellRegex.test(message.text)) {
    try {
      await sendMessage(getChristmasMessage(), message.chat.id);
    } catch (error) {
      console.error(error);
    }
  }

  return res.send();
});

app.listen(PORT || 5000, async () => {
  console.log(`Server running on port ${PORT || 5000}`);
  await init();
});
