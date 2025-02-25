const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const bot = new TelegramBot(process.env.BOT_TOKEN);

async function sendMessage(message) {
  try {
    console.log('Отправка сообщения в Telegram:', message);
    await bot.sendMessage(process.env.CHAT_ID, message);
    console.log('Сообщение успешно отправлено');
  } catch (error) {
    console.error('Ошибка при отправке в Telegram:', error.message);
  }
}

module.exports = { sendMessage };