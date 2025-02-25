const axios = require('axios');

async function fetchItemPrices(itemIds) {
  const prices = {};
  for (const id of itemIds) {
    const url = `https://saddlebagexchange.com/wow/item-data/${id}?_data=routes%2Fwow.item-data.%24itemId`;
    try {
      console.log(`Запрос к ${url}...`);
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
          'Referer': 'https://saddlebagexchange.com/',
          'Accept': '*/*',
          'Cookie': 'wow_region=EU; wow_realm_name=Gordunni; wow_realm_id=1602; __session=eyJkYXRhX2NlbnRlciI6IkVVIiwid29ybGQiOiJHb3JkdW5uaSIsIndvd19yZWFsbV9pZCI6MTYwMiwid293X3JlYWxtX25hbWUiOiJHb3JkdW5uaSIsIndvd19yZWdpb24iOiJFVSJ9',
        },
      });

      console.log(`Статус ответа: ${response.status} ${response.statusText}`);

      const data = response.data.data;
      const listings = data.listingData.slice(0, 3); // Первые 3 лота

      prices[id] = {
        listings: listings.map(l => ({ price: l.price, quantity: l.quantity })),
        minPrice: data.minPrice,
        totalQuantity: data.quantity,
        salesPerDay: data.salesPerDay || 0, // Количество продаж в день
      };
    } catch (error) {
      console.error(`Ошибка для ${id}: ${error.message}`);
      prices[id] = { listings: [], minPrice: null, totalQuantity: 0, salesPerDay: 0 };
    }
  }
  return prices;
}

module.exports = { fetchItemPrices };