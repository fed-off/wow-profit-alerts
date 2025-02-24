const { fetchTSMData } = require('./api/tsm');
const { calculateProfit } = require('./calculations/profit');
const { recipes } = require('./config/recipes');
const schedule = require('node-schedule');

async function run() {
  console.log('Запуск проверки цен...');

  // ID предметов для запроса
  const itemIds = [222733, 220147]; // Пир и акула
  const prices = await fetchTSMData(itemIds);

  if (!prices) {
    console.log('Не удалось получить данные о ценах.');
    return;
  }

  // Парсинг данных из ответа TSM API
  const feastPrice = prices.find(item => item.itemId === 222733)?.minBuyout || 0;
  const sharkPrice = prices.find(item => item.itemId === 220147)?.minBuyout || 0;

  // Обновляем рецепт с актуальной ценой акулы
  const recipe = { ...recipes.midnightMasqueradeFeast };
  recipe.ingredients.find(ing => ing.itemId === 220147).price = sharkPrice;

  // Расчёт прибыли для 200 наборов (1000 акул = 200 наборов по 5 акул)
  const analysis = calculateProfit(recipe, feastPrice, 200);

  console.log(`Цена пира: ${feastPrice} золота`);
  console.log(`Цена акулы: ${sharkPrice} золота`);
  console.log(`Прибыль с 1 пира: ${analysis.profitPerItem} золота`);
  console.log(`Общая прибыль с 1500 пиров: ${analysis.totalProfit} золота`);

  // Условие для уведомления (пока просто логи)
  if (analysis.totalProfit > 30000) {
    console.log('Выгодно готовить пир! Нужно уведомить в Telegram!');
  } else {
    console.log('Сейчас готовить невыгодно.');
  }
}

// Запуск каждый час
schedule.scheduleJob('0 * * * *', run);

// Первый запуск сразу
run();