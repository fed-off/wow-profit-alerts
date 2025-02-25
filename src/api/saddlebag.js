const axios = require('axios');
const https = require('https');

async function fetchAuctionPrices(region, realm, itemIds) {
  const url = `https://api.saddlebagexchange.com/public/wow/auction-house/v2/region/${region}/realm/${realm}/commodities`;
  const agent = new https.Agent({ minVersion: 'TLSv1.2' });
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      httpsAgent: agent,
      headers: { 'User-Agent': 'WowProfitBot/1.0' },
    });
    const auctions = response.data.auctions;
    const prices = {};
    itemIds.forEach(id => {
      const itemAuction = auctions.find(a => a.item.id === id);
      prices[id] = itemAuction ? itemAuction.unit_price / 10000 : null;
    });
    console.log('Успешно получил данные:', prices);
    return prices;
  } catch (error) {
    console.error('Ошибка запроса:', error.message);
    if (error.code) console.error('Код ошибки:', error.code);
    if (error.response) console.error('Ответ сервера:', error.response.status);
    return null;
  }
}

module.exports = { fetchAuctionPrices };