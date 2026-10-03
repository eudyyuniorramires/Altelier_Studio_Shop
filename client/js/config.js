/**
 * Configuración global del cliente E-Commerce
 */
export const CONFIG = {
  // Si se ejecuta en el mismo puerto que el backend ASP.NET Core, usa ruta relativa;
  // de lo contrario, apunta al puerto local de la API (5000 / 5124)
  API_BASE_URL: window.location.port === '5000' || window.location.port === '5001'
    ? '/api'
    : 'http://localhost:5000/api',

  STORAGE_KEYS: {
    CART: 'atelier_fashion_cart_v1',
    LAST_ORDER: 'atelier_last_order_v1'
  },

  CURRENCY: {
    SYMBOL: '$',
    CODE: 'USD',
    LOCALE: 'en-US'
  },

  STRIPE: {
    PUBLISHABLE_KEY: 'pk_test_51MockStripeKeyForTestingATELIER0000000000'
  }
};
