function calculateProfit(recipe, marketPrice, sharkPrice, sharkQty, totalItems) {
  const updatedRecipe = {
    ...recipe,
    ingredients: recipe.ingredients.map(ing =>
      ing.name === 'Кахетская трущобная акула' ? { ...ing, price: sharkPrice } : ing
    ),
  };

  const sets = sharkQty / 5; // Количество наборов (5 акул на набор)
  const procFactor = totalItems / (sets * recipe.yield); // Динамический коэффициент прока
  const baseCost =
    updatedRecipe.ingredients.reduce((sum, { qty, price }) => sum + qty * price, 0) /
    updatedRecipe.yield;
  const adjustedCost = baseCost / procFactor;
  const effectivePrice = marketPrice * 0.95;
  const profitPerItem = effectivePrice - adjustedCost;
  const totalProfit = profitPerItem * totalItems;
  const totalCost = adjustedCost * totalItems;

  const minSellPrice = adjustedCost / 0.95;
  const targetProfit30k = 30000;
  const targetProfit50k = 50000;
  const targetSellPrice30k = (adjustedCost + targetProfit30k / totalItems) / 0.95;
  const targetSellPrice50k = (adjustedCost + targetProfit50k / totalItems) / 0.95;
  const profitStepPerShark = 10 * recipe.yield * procFactor * 0.95 / 5;

  const profitPercentage = totalProfit > 0 ? (totalProfit / totalCost) * 100 : 0;
  const profitPerShark = totalProfit / sharkQty;
  const recommendedSellPrice = minSellPrice + 10;

  const graphData = [];
  const startPrice = Math.floor((minSellPrice - 20) / 5) * 5;
  for (let price = startPrice; price <= marketPrice + 20; price += 5) {
    const effectiveGraphPrice = price * 0.95;
    const graphProfit = (effectiveGraphPrice - adjustedCost) * totalItems;
    const graphProfitPerItem = (effectiveGraphPrice - adjustedCost);
    graphData.push({
      price: Math.round(price),
      profit: Math.round(graphProfit),
      profitPerItem: Math.round(graphProfitPerItem * 10) / 10,
    });
  }
  const zeroProfitPrice = Math.round(adjustedCost / 0.95);
  if (!graphData.some(d => d.price === zeroProfitPrice)) {
    graphData.push({ price: zeroProfitPrice, profit: 0, profitPerItem: 0 });
    graphData.sort((a, b) => a.price - b.price);
  }

  return {
    profitPerItem: Math.round(profitPerItem),
    totalProfit: Math.round(totalProfit),
    totalCost: Math.round(totalCost),
    adjustedCost: Math.round(adjustedCost),
    minSellPrice: Math.round(minSellPrice),
    targetSellPrice30k: Math.round(targetSellPrice30k),
    targetSellPrice50k: Math.round(targetSellPrice50k),
    profitStepPerShark: Math.round(profitStepPerShark),
    profitPercentage: Math.round(profitPercentage),
    profitPerShark: Math.round(profitPerShark * 10) / 10,
    recommendedSellPrice: Math.round(recommendedSellPrice),
    procFactor: Math.round(procFactor * 100) / 100, // Для отладки, если нужно
    graphData,
  };
}