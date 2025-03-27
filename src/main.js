const { fetchItemPrices } = require('./api/saddlebag-scraper');
const { sendMessage } = require('./telegram/bot');

const SHARK_ID = 220147;
const FEAST_ID = 222733;
const SHARK_QTY = 1000;

async function checkPrices() {
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

  // Расчёт прибыли
  const sets = SHARK_QTY / 5; // 200 рецептов
  const totalItems = sets * 5 * 1.5; // 1500 пиров
  const otherIngredientsCost = (60 * 5 + 15 * 5 + 50 * 0.2 + 1 * 30) * sets; // 71,000g
  const totalCost = sharkPrice * SHARK_QTY + otherIngredientsCost; // Затраты
  const totalRevenue = feastPrice * totalItems * 0.95; // Доход с учётом комиссии
  const currentProfit = totalRevenue - totalCost; // Прибыль

  // Цены пирога
  const minFeastPrice = Math.ceil(totalCost / totalItems / 0.95); // Для нуля
  const targetProfit30k = 30000;
  const targetProfit50k = 50000;
  const targetFeastPrice30k = Math.ceil((targetProfit30k + totalCost) / totalItems / 0.95); // Для 30k
  const targetFeastPrice50k = Math.ceil((targetProfit50k + totalCost) / totalItems / 0.95); // Для 50k

  // Отправка, если прибыль ≥ 30,000g
  if (currentProfit >= 30000) {
    const sharkPriceChange = sharkPrevPrice ? (sharkPrice > sharkPrevPrice ? '➚' : sharkPrice < sharkPrevPrice ? '➘' : '') : '';
    const feastPriceChange = feastPrevPrice ? (feastPrice > feastPrevPrice ? '➚' : feastPrice < feastPrevPrice ? '➘' : '') : '';
    const sharkQtyChange = sharkPrevQty ? (sharkQty > sharkPrevQty ? '➚' : sharkQty < sharkPrevQty ? '➘' : '') : '';
    const feastQtyChange = feastPrevQty ? (feastQty > feastPrevQty ? '➚' : feastQty < feastPrevQty ? '➘' : '') : '';

    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const dateStr = `${now.getDate()}.${now.getMonth() + 1}.${now.getFullYear()}`;
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} (${days[now.getDay()]})`;

    const sharkListings = prices[SHARK_ID]?.listings || [];
    const feastListings = prices[FEAST_ID]?.listings || [];

    const message = `
📈 Текущая прибыль: ${Math.round(currentProfit)} g
Минимальная цена пирога: ${minFeastPrice} g
Цена пирога для 30k: ${targetFeastPrice30k} g
Цена пирога для 50k: ${targetFeastPrice50k} g
-----
${dateStr}
${timeStr}

🦈 Акула
Общее количество: ${sharkQty} ${sharkQtyChange}
Мин. цена: ${sharkPrice} g ${sharkPriceChange}
Селрейт: ${sharkSales}/день
Лоты:
1. ${sharkListings[0]?.price || '-'} g (${sharkListings[0]?.quantity || 0})
2. ${sharkListings[1]?.price || '-'} g (${sharkListings[1]?.quantity || 0})
3. ${sharkListings[2]?.price || '-'} g (${sharkListings[2]?.quantity || 0})

🍜 Пир
Общее количество: ${feastQty} ${feastQtyChange}
Мин. цена: ${feastPrice} g ${feastPriceChange}
Селрейт: ${feastSales}/день
Лоты:
1. ${feastListings[0]?.price || '-'} g (${feastListings[0]?.quantity || 0})
2. ${feastListings[1]?.price || '-'} g (${feastListings[1]?.quantity || 0})
3. ${feastListings[2]?.price || '-'} g (${feastListings[2]?.quantity || 0})
    `.trim();

    await sendMessage(message);
  } else {
    console.log(`Прибыль (${Math.round(currentProfit)} g) меньше 30,000 g — сообщение не отправлено`);
  }

  if (process.env.GITHUB_ACTIONS) process.exit(0);
}

if (!process.env.GITHUB_ACTIONS) {
  const schedule = require('node-schedule');
  schedule.scheduleJob('*/5 * * * *', checkPrices);
}

checkPrices();