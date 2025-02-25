const schedule = require('node-schedule');
const { fetchItemPrices } = require('./api/saddlebag-scraper');
const { calculateProfit } = require('./calculations/profit');
const { recipes } = require('./config/recipes');
const { sendMessage } = require('./telegram/bot');

const SHARK_ID = 220147;
const FEAST_ID = 222733;
const SHARK_QTY = 1000;
const FIXED_SHARK_PRICE = 500;

async function checkPrices() {
  console.log('Проверка цен...', new Date().toLocaleString());

  const prices = await fetchItemPrices([SHARK_ID, FEAST_ID]);

  const sharkPrice = prices[SHARK_ID]?.minPrice || 500;
  const feastPrice = prices[FEAST_ID]?.minPrice || 410;
  const sharkQty = prices[SHARK_ID]?.totalQuantity || 0;
  const feastQty = prices[FEAST_ID]?.totalQuantity || 0;
  const sharkSales = prices[SHARK_ID]?.salesPerDay || 0;
  const feastSales = prices[FEAST_ID]?.salesPerDay || 0;
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

  const sharkListings = prices[SHARK_ID]?.listings || [];
  const feastListings = prices[FEAST_ID]?.listings || [];

  // Логика фраз
  const sharkStatus = sharkPrice <= 501 ? '🦈 СКУПАЕМ АКУЛУ' :
                     sharkPrice <= 510 ? '🦈 Проверяем акулу' :
                     '🦈 Акулы фигня';
  const feastStatus = feastPrice >= 420 ? '🍖 СЛИВАЕМ ПИРЫ' :
                     feastPrice >= 403 ? '🍖 Проверяем пиры' :
                     feastPrice >= 380 ? '🍖 Пиры фигня' : '🍖 Всё ок';

  // Дата и время
  const now = new Date();
  const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const dateStr = `${now.getDate()}.${now.getMonth() + 1}.${now.getFullYear()} (${days[now.getDay()]}) ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const message = `
📈 ${dateStr}
${sharkStatus} | ${feastStatus}

🦈 Акула (${sharkQty} шт, ~${sharkSales}/день)
1. ${sharkListings[0]?.price || '-'} g (${sharkListings[0]?.quantity || 0})
2. ${sharkListings[1]?.price || '-'} g (${sharkListings[1]?.quantity || 0})
3. ${sharkListings[2]?.price || '-'} g (${sharkListings[2]?.quantity || 0})

🍖 Пир (${feastQty} шт, ~${feastSales}/день)
1. ${feastListings[0]?.price || '-'} g (${feastListings[0]?.quantity || 0})
2. ${feastListings[1]?.price || '-'} g (${feastListings[1]?.quantity || 0})
3. ${feastListings[2]?.price || '-'} g (${feastListings[2]?.quantity || 0})

💰 Прибыль на 1000 акул
Текущая: ${currentAnalysis.totalProfit} g
По 500g: ${fixedAnalysis.totalProfit} g
  `.trim();

  sendMessage(message);
}

schedule.scheduleJob('5 * * * *', checkPrices);
checkPrices();