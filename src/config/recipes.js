const recipes = {
  midnightMasqueradeFeast: {
    name: 'Пир полуночного маскарада',
    itemId: 222733,
    yield: 5, // Базовый выход — 5 пиров
    procFactor: 1.5, // Учёт прока
    ingredients: [
      { name: 'Порционный стейк', qty: 60, price: 3 },
      { name: 'Пряный мясной бульон', qty: 15, price: 3 },
      { name: 'Кахетская трущобная акула', itemId: 220147, qty: 5, price: null }, // Цена будет из API
      { name: 'Букетик трав', qty: 50, price: 0.2 },
      { name: 'Горячие соты', qty: 1, price: 20 },
    ],
  },
};

module.exports = { recipes };