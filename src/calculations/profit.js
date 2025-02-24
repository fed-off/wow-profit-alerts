function calculateProfit(recipe, marketPrice, sets) {
  // Стоимость реагентов для 1 набора (5 пиров без прока)
  const baseCost =
    recipe.ingredients.reduce((sum, { qty, price }) => sum + qty * price, 0) / recipe.yield;

  // Учёт прока (1.5x выход)
  const adjustedCost = baseCost / recipe.procFactor;

  // Прибыль с 1 пира
  const profitPerItem = marketPrice - adjustedCost;

  // Общая прибыль с учётом количества наборов и прока
  const totalItems = sets * recipe.yield * recipe.procFactor;
  const totalProfit = profitPerItem * totalItems;

  return {
    profitPerItem: Math.round(profitPerItem),
    totalProfit: Math.round(totalProfit),
    adjustedCost: Math.round(adjustedCost),
  };
}

module.exports = { calculateProfit };