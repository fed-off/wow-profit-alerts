const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const bot = new TelegramBot(process.env.BOT_TOKEN);

function sendMessage(message) {
  bot.sendMessage(process.env.CHAT_ID, message);
}

module.exports = { sendMessage };