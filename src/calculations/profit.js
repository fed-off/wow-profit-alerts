function calculateProfit(recipe, marketPrice, sharkPrice, sets) {
  // Подставляем цену акулы в рецепт
  const updatedRecipe = {
    ...recipe,
    ingredients: recipe.ingredients.map(ing =>
      ing.name === 'Кахетская трущобная акула' ? { ...ing, price: sharkPrice } : ing
    ),
  };

  // Стоимость реагентов для 1 набора (5 пиров без прока)
  const baseCost =
    updatedRecipe.ingredients.reduce((sum, { qty, price }) => sum + qty * price, 0) /
    updatedRecipe.yield;

  // Учёт прока (1.5x выход)
  const adjustedCost = baseCost / updatedRecipe.procFactor;

  // Прибыль с 1 пира
  const profitPerItem = marketPrice - adjustedCost;

  // Общая прибыль с учётом количества наборов и прока (1000 акул = 200 наборов → 1500 пиров)
  const totalItems = sets * updatedRecipe.yield * updatedRecipe.procFactor;
  const totalProfit = profitPerItem * totalItems;

  // Минимальная цена продажи для нулевой прибыли (break-even point)
  const minSellPrice = adjustedCost;

  // Минимальная цена для целевой прибыли (например, 30,000 золота с 1500 пиров)
  const targetProfit = 30000;
  const targetSellPrice = adjustedCost + targetProfit / totalItems;

  return {
    profitPerItem: Math.round(profitPerItem),
    totalProfit: Math.round(totalProfit),
    adjustedCost: Math.round(adjustedCost),
    minSellPrice: Math.round(minSellPrice), // До какой цены можно опустить
    targetSellPrice: Math.round(targetSellPrice), // Цена для 30k прибыли
  };
}

module.exports = { calculateProfit };