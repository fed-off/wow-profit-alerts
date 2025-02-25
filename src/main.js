const schedule = require('node-schedule');
const { fetchItemPrices } = require('./api/saddlebag-scraper');
const { calculateProfit } = require('./calculations/profit');
const { recipes } = require('./config/recipes');
const { sendMessage } = require('./telegram/bot');

const SHARK_ID = 220147;
const FEAST_ID = 222733;
const SHARK_QTY = 1000;
const FIXED_SHARK_PRICE = 500;

let lastPrices = { [SHARK_ID]: { minPrice: null, totalQuantity: 0 }, [FEAST_ID]: { minPrice: null, totalQuantity: 0 } };

async function checkPrices() {
  console.log('Проверка цен...', new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' }));

  const prices = await fetchItemPrices([SHARK_ID, FEAST_ID]);

  const sharkPrice = prices[SHARK_ID]?.minPrice || 500;
  const feastPrice = prices[FEAST_ID]?.minPrice || 410;
  const sharkQty = prices[SHARK_ID]?.totalQuantity || 0;
  const feastQty = prices[FEAST_ID]?.totalQuantity || 0;
  const sharkSales = prices[SHARK_ID]?.salesPerDay || 0;
  const feastSales = prices[FEAST_ID]?.salesPerDay || 0;
  const totalItems = SHARK_QTY / 5 * recipes.midnightMasqueradeFeast.yield * 1.5;

  const currentAnalysis = calculateProfit(recipes.midnightMasqueradeFeast, feastPrice, sharkPrice, SHARK_QTY, totalItems);
  const fixedAnalysis = calculateProfit(recipes.midnightMasqueradeFeast, feastPrice, FIXED_SHARK_PRICE, SHARK_QTY, totalItems);

  const sharkListings = prices[SHARK_ID]?.listings || [];
  const feastListings = prices[FEAST_ID]?.listings || [];

  const sharkStatus = sharkPrice <= 501 ? '✅' : sharkPrice <= 510 ? '❓' : '❌';
  const feastStatus = feastPrice >= 420 ? '✅' : feastPrice >= 405 ? '❓' : '❌';

  const sharkPriceChange = lastPrices[SHARK_ID].minPrice ? (sharkPrice > lastPrices[SHARK_ID].minPrice ? '🟢' : sharkPrice < lastPrices[SHARK_ID].minPrice ? '🔴' : '') : '';
  const feastPriceChange = lastPrices[FEAST_ID].minPrice ? (feastPrice > lastPrices[FEAST_ID].minPrice ? '🟢' : feastPrice < lastPrices[FEAST_ID].minPrice ? '🔴' : '') : '';
  const sharkQtyChange = lastPrices[SHARK_ID].totalQuantity ? (sharkQty > lastPrices[SHARK_ID].totalQuantity ? '🟢' : sharkQty < lastPrices[SHARK_ID].totalQuantity ? '🔴' : '') : '';
  const feastQtyChange = lastPrices[FEAST_ID].totalQuantity ? (feastQty > lastPrices[FEAST_ID].totalQuantity ? '🟢' : feastQty < lastPrices[FEAST_ID].totalQuantity ? '🔴' : '') : '';

  lastPrices[SHARK_ID] = { minPrice: sharkPrice, totalQuantity: sharkQty };
  lastPrices[FEAST_ID] = { minPrice: feastPrice, totalQuantity: feastQty };

  const now = new Date();
  const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const dateStr = `${now.getDate()}.${now.getMonth() + 1}.${now.getFullYear()} (${days[now.getDay()]}) ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const message = `
📈 ${dateStr}

🦈 Акула ${sharkStatus}
Общее количество: ${sharkQty} ${sharkQtyChange}
Мин. цена: ${sharkPrice} g ${sharkPriceChange}
Селрейт: ${sharkSales}/день
Лоты:
1. ${sharkListings[0]?.price || '-'} g (${sharkListings[0]?.quantity || 0})
2. ${sharkListings[1]?.price || '-'} g (${sharkListings[1]?.quantity || 0})
3. ${sharkListings[2]?.price || '-'} g (${sharkListings[2]?.quantity || 0})

🍖 Пир ${feastStatus}
Общее количество: ${feastQty} ${feastQtyChange}
Мин. цена: ${feastPrice} g ${feastPriceChange}
Селрейт: ${feastSales}/день
Лоты:
1. ${feastListings[0]?.price || '-'} g (${feastListings[0]?.quantity || 0})
2. ${feastListings[1]?.price || '-'} g (${feastListings[1]?.quantity || 0})
3. ${feastListings[2]?.price || '-'} g (${feastListings[2]?.quantity || 0})

💰 Прибыль на 1000 акул
Текущая: ${currentAnalysis.totalProfit} g
По 500g: ${fixedAnalysis.totalProfit} g
  `.trim();

  await sendMessage(message); // Ждём отправку
}

schedule.scheduleJob('2 * * * *', checkPrices); // UTC 02 = МСК 05
checkPrices();