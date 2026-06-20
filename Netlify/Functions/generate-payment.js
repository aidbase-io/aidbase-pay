// netlify/functions/generate-payment.js

const fetch = require('node-fetch');

exports.handler = async (event) => {
  // Solo POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body);

    // Parámetros
    const {
      eventId,
      eventName,
      eventPrice,
      productName
    } = body;

    // Validar
    if (!eventPrice || eventPrice <= 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid price' })
      };
    }

    // Config
    const PAYME_SELLER_ID = 'MPL17810-87253VNE-RYRTJMZ8-AYLC7AOV';
    const MARKET_FEE = 2.4; // Tu comisión 2.4%
    const PAYME_API_URL = 'https://api.payme.io/api/generate-sale';

    // Llamar PayMe API
    const response = await fetch(PAYME_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        seller_payme_id: PAYME_SELLER_ID,
        sale_price: Math.round(eventPrice * 100), // Convertir a agorot (centavos)
        currency: 'ILS',
        product_name: productName || 'קייטנה',
        transaction_id: `${eventId}-${Date.now()}`,
        market_fee: MARKET_FEE, // 2.4% commission
        sale_payment_method: 'multi', // Mostrar todos los métodos
        installments: '1',
        language: 'he'
      })
    });

    const data = await response.json();

    if (data.status_code === 0 && data.sale_url) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          sale_url: data.sale_url,
          payme_sale_id: data.payme_sale_id
        })
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: data.error_msg || 'Payment generation failed'
        })
      };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
