const axios = require('axios');
require('dotenv').config();

const TSM_API_KEY = process.env.TSM_API_KEY;
const REGION = 'EU';
const REALM = 'Gordunni';

// Функция для получения цен с TSM API
async function fetchTSMData(itemIds) {
  try {
    const response = await axios.get(
      `https://pricing-api.tradeskillmaster.com/item/${REGION}/${REALM}?items=${itemIds.join(',')}&apiKey=${TSM_API_KEY}`
    );
    return response.data;
  } catch (error) {
    console.error('Ошибка при запросе к TSM API:', error.message);
    return null;
  }
}

module.exports = { fetchTSMData };