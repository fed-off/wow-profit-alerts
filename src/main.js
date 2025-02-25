const schedule = require('node-schedule');
const { fetchAuctionPrices } = require('./api/saddlebag');
const { calculateProfit } = require('./calculations/profit');
const { recipes } = require('./config/recipes');
const { sendMessage } = require('./telegram/bot');

const SHARK_ID = 220147;
const FEAST_ID = 222733;
const TOKEN_ID = 122284;
const REGION = 'eu';
const REALM = 'gordunni';
const SHARK_QTY = 1000;
const FIXED_SHARK_PRICE = 500;

async function checkPrices(retryCount = 0, maxRetries = 3) {
  console.log('Проверка цен...', new Date().toLocaleString());
  const prices = await fetchAuctionPrices(REGION, REALM, [SHARK_ID, FEAST_ID, TOKEN_ID]);

  if (!prices && retryCount < maxRetries) {
    console.log(`Повторная попытка ${retryCount + 1}/${maxRetries} через 1 минуту...`);
    setTimeout(() => checkPrices(retryCount + 1, maxRetries), 60 * 1000);
    return;
  }

  if (!prices) {
    sendMessage('Не удалось получить данные с аукциона после всех попыток.');
    return;
  }

  const sharkPrice = prices[SHARK_ID] || 500;
  const feastPrice = prices[FEAST_ID] || 410;
  const tokenPrice = prices[TOKEN_ID] || 0;
  const totalItems = SHARK_QTY / 5 * recipes.midnightMasqueradeFeast.yield * 1.5;

  const currentAnalysis = calculateProfit(
    recipes.midnightMasqueradeFeast,
    feastPrice,
    sharkPrice,
    SHARK_QTY,
    totalItems
  );

  const fixedAnalysis = calculateProfit(
    recipes.midnightMasqueradeFeast,
    feastPrice,
    FIXED_SHARK_PRICE,
    SHARK_QTY,
    totalItems
  );

  const message = `
📊 Аукцион (Гордунни, EU):
- Акула: ${sharkPrice} g
- Пир: ${feastPrice} g
- Жетон: ${tokenPrice} g
- Прибыль (1000 акул сейчас): ${currentAnalysis.totalProfit} g
- Прибыль (акулы по 500g): ${fixedAnalysis.totalProfit} g
  `.trim();

  sendMessage(message);
  console.log(message);
}

// Запуск каждый час на 5-й минуте
schedule.scheduleJob('5 * * * *', () => checkPrices(0, 3));

// Первый запуск для теста
checkPrices(0, 3);