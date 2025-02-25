const { fetchItemPrices } = require('./api/saddlebag-scraper');
const { calculateProfit } = require('./calculations/profit');
const { recipes } = require('./config/recipes');
const { sendMessage } = require('./telegram/bot');

const SHARK_ID = 220147;
const FEAST_ID = 222733;
const SHARK_QTY = 1000;
const FIXED_SHARK_PRICE = 500;

async function checkPrices() {
  // Время для МСК (+3 от UTC)
  const now = process.env.GITHUB_ACTIONS ? new Date(Date.now() + 3 * 60 * 60 * 1000) : new Date();
  console.log('Проверка цен...', now.toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' }));

  const prices = await fetchItemPrices([SHARK_ID, FEAST_ID]);

  const sharkPrice = prices[SHARK_ID]?.minPrice || 500;
  const feastPrice = prices[FEAST_ID]?.minPrice || 410;
  const sharkQty = prices[SHARK_ID]?.totalQuantity || 0;
  const feastQty = prices[FEAST_ID]?.totalQuantity || 0;
  const sharkSales = prices[SHARK_ID]?.salesPerDay || 0;
  const feastSales = prices[FEAST_ID]?.salesPerDay || 0;
  const sharkPrevPrice = prices[SHARK_ID]?.prevMinPrice;
  const feastPrevPrice = prices[FEAST_ID]?.prevMinPrice;
  const sharkPrevQty = prices[SHARK_ID]?.prevTotalQuantity;
  const feastPrevQty = prices[FEAST_ID]?.prevTotalQuantity;
  const totalItems = SHARK_QTY / 5 * recipes.midnightMasqueradeFeast.yield * 1.5;

  const currentAnalysis = calculateProfit(recipes.midnightMasqueradeFeast, feastPrice, sharkPrice, SHARK_QTY, totalItems);
  const fixedAnalysis = calculateProfit(recipes.midnightMasqueradeFeast, feastPrice, FIXED_SHARK_PRICE, SHARK_QTY, totalItems);

  const sharkListings = prices[SHARK_ID]?.listings || [];
  const feastListings = prices[FEAST_ID]?.listings || [];

  const sharkStatus = sharkPrice <= 501 ? '✅' : sharkPrice <= 510 ? '❓' : '❌';
  const feastStatus = feastPrice >= 445 ? '✅✅' : feastPrice >= 420 ? '✅' : feastPrice >= 405 ? '❓' : '❌';

  const sharkPriceChange = sharkPrevPrice ? (sharkPrice > sharkPrevPrice ? '➚' : sharkPrice < sharkPrevPrice ? '➘' : '') : '';
  const feastPriceChange = feastPrevPrice ? (feastPrice > feastPrevPrice ? '➚' : feastPrice < sharkPrevPrice ? '➘' : '') : '';
  const sharkQtyChange = sharkPrevQty ? (sharkQty > sharkPrevQty ? '➚' : sharkQty < sharkPrevQty ? '➘' : '') : '';
  const feastQtyChange = feastPrevQty ? (feastQty > feastPrevQty ? '➚' : feastQty < feastPrevQty ? '➘' : '') : '';

  const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const dateStr = `${now.getDate()}.${now.getMonth() + 1}.${now.getFullYear()}`;
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} (${days[now.getDay()]})`;

  const message = `
Пир ${feastStatus}  | Акула ${sharkStatus}
------------------
${dateStr}
${timeStr}


🦈 Акула
Общее количество: ${sharkQtyChange} ${sharkQty} 
Мин. цена: ${sharkPriceChange} ${sharkPrice}g 
Селлрейт: ${sharkSales}/день
Лоты:
  1. ${sharkListings[0]?.price || '-'}g (${sharkListings[0]?.quantity || 0})
  2. ${sharkListings[1]?.price || '-'}g (${sharkListings[1]?.quantity || 0})
  3. ${sharkListings[2]?.price || '-'}g (${sharkListings[2]?.quantity || 0})

🍜 Пир
Общее количество: ${feastQtyChange} ${feastQty} 
Мин. цена: ${feastPriceChange} ${feastPrice}g 
Селлрейт: ${feastSales}/день
Лоты:
  1. ${feastListings[0]?.price || '-'}g (${feastListings[0]?.quantity || 0})
  2. ${feastListings[1]?.price || '-'}g (${feastListings[1]?.quantity || 0})
  3. ${feastListings[2]?.price || '-'}g (${feastListings[2]?.quantity || 0})


💰 Прибыль на 1000 акул
Текущая: ${currentAnalysis.totalProfit}g
По 500g: ${fixedAnalysis.totalProfit}g
  `.trim();

  await sendMessage(message);
  if (process.env.GITHUB_ACTIONS) process.exit(0);
}

// Для локального теста
if (!process.env.GITHUB_ACTIONS) {
  const schedule = require('node-schedule');
  schedule.scheduleJob('*/5 * * * *', checkPrices);
}

checkPrices();