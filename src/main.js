const { calculateProfit } = require('./calculations/profit');
const { recipes } = require('./config/recipes');

// Функция для расчёта и вывода
function run(feastPrice, sharkPrice) {
  const recipe = recipes.midnightMasqueradeFeast;
  const sets = 200; // 1000 акул = 200 наборов по 5 акул

  const analysis = calculateProfit(recipe, feastPrice, sharkPrice, sets);

  console.log(`Текущая цена пира: ${feastPrice} золота`);
  console.log(`Текущая цена акулы: ${sharkPrice} золота`);
  console.log(`Затраты на 1 пир (с проком): ${analysis.adjustedCost} золота`);
  console.log(`Прибыль с 1 пира: ${analysis.profitPerItem} золота`);
  console.log(`Общая прибыль с 1500 пиров: ${analysis.totalProfit} золота`);
  console.log(`Мин. цена продажи (без убытков): ${analysis.minSellPrice} золота`);
  console.log(`Цена для 30k прибыли: ${analysis.targetSellPrice} золота`);

  if (analysis.totalProfit > 30000) {
    console.log('Выгодно готовить! Можно продавать.');
  } else if (analysis.totalProfit > 0) {
    console.log('Прибыль есть, но меньше 30k. Решай сам.');
  } else {
    console.log('Готовить невыгодно, убытки.');
  }
}

// Пример вызова с руками заданными ценами
const feastPrice = 417; // Текущая цена пира
const sharkPrice = 522; // Текущая цена акулы
run(feastPrice, sharkPrice);