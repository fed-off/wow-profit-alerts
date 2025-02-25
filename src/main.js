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
  const sharkStatus = [];
  const feastStatus = [];
  if (sharkPrice <= 501) sharkStatus.push('🦈 СКУПАЕМ АКУЛУ');
  else if (sharkPrice > 501 && sharkPrice <= 510) sharkStatus.push('🦈 Проверяем акулу');
  else if (sharkPrice > 510) sharkStatus.push('🦈 Акулы фигня');

  if (feastPrice >= 420) feastStatus.push('🍖 СЛИВАЕМ ПИРЫ');
  else if (feastPrice < 420 && feastPrice >= 403) feastStatus.push('🍖 Проверяем пиры');
  else if (feastPrice < 403 && feastPrice >= 380) feastStatus.push('🍖 Пиры фигня');

  if (feastQty > 20000) feastStatus.push('🍖 Перенасыщенность пирами');
  else if (feastQty < 12000) feastStatus.push('🍖 Время продавать');

  // Дата и время
  const now = new Date();
  const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const dateStr = `${now.getDate()}.${now.getMonth() + 1}.${now.getFullYear()} (${days[now.getDay()]}) ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const message = `
📈 *Аукцион Гордунни* | ${dateStr}
${sharkStatus.join(' | ') || '🦈 Всё ок'}
${feastStatus.join(' | ') || '🍖 Всё ок'}

🦈 *Акула* | ${sharkQty} шт | ~${sharkSales}/день
  1️⃣ ${sharkListings[0]?.price || '-'} g (${sharkListings[0]?.quantity || 0})
  2️⃣ ${sharkListings[1]?.price || '-'} g (${sharkListings[1]?.quantity || 0})
  3️⃣ ${sharkListings[2]?.price || '-'} g (${sharkListings[2]?.quantity || 0})

🍖 *Пир* | ${feastQty} шт | ~${feastSales}/день
  1️⃣ ${feastListings[0]?.price || '-'} g (${feastListings[0]?.quantity || 0})
  2️⃣ ${feastListings[1]?.price || '-'} g (${feastListings[1]?.quantity || 0})
  3️⃣ ${feastListings[2]?.price || '-'} g (${feastListings[2]?.quantity || 0})

💰 *Прибыль на 1000 акул*
  Сейчас: **${currentAnalysis.totalProfit} g**
  Если акулы по 500g: **${fixedAnalysis.totalProfit} g**
  `.trim();

  sendMessage(message);
}

schedule.scheduleJob('5 * * * *', checkPrices);
checkPrices();