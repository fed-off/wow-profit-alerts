function calculateProfit(recipe, marketPrice, sharkPrice, sharkQty, totalItems) {
  const updatedRecipe = {
    ...recipe,
    ingredients: recipe.ingredients.map(ing =>
      ing.name === 'Кахетская трущобная акула' ? { ...ing, price: sharkPrice } : ing
    ),
  };

  const sets = sharkQty / 5;
  const procFactor = totalItems / (sets * recipe.yield);
  const baseCost =
    updatedRecipe.ingredients.reduce((sum, { qty, price }) => sum + qty * price, 0) /
    updatedRecipe.yield;
  const adjustedCost = baseCost / procFactor;
  const effectivePrice = marketPrice * 0.95;
  const profitPerItem = effectivePrice - adjustedCost;
  const totalProfit = profitPerItem * totalItems;
  const totalCost = adjustedCost * totalItems;

  const minSellPrice = adjustedCost / 0.95;
  const profitPerShark = totalProfit / sharkQty;

  return {
    totalProfit: Math.round(totalProfit),
    totalCost: Math.round(totalCost),
    adjustedCost: Math.round(adjustedCost),
    minSellPrice: Math.round(minSellPrice),
    profitPerShark: Math.round(profitPerShark * 10) / 10,
  };
}

module.exports = { calculateProfit };