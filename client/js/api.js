import { CONFIG } from './config.js';

/**
 * Módulo de consumo HTTP para la RESTful API de ASP.NET Core
 */

class ApiService {
  constructor() {
    this.baseUrl = CONFIG.API_BASE_URL;
  }

  /**
   * Helper genérico para peticiones fetch con manejo de JSON y errores HTTP
   */
  async #request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: `Error HTTP ${response.status}: ${response.statusText}` };
        }
        
        const error = new Error(errorData.detail || errorData.error || errorData.message || 'Error en la petición');
        error.status = response.status;
        error.data = errorData;
        throw error;
      }

      return await response.json();
    } catch (err) {
      console.warn(`[API] Falló la petición a ${url}:`, err.message);
      throw err;
    }
  }

  /**
   * Obtiene la lista de productos del catálogo
   */
  async getProducts(category = '') {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    return await this.#request(`/products${query}`);
  }

  /**
   * Obtiene el detalle de un producto por ID
   */
  async getProductById(id) {
    return await this.#request(`/products/${id}`);
  }

  /**
   * Obtiene las categorías de ropa disponibles
   */
  async getCategories() {
    return await this.#request('/products/categories');
  }

  /**
   * Registra una nueva orden en el backend (estado: Pending)
   */
  async createOrder(orderPayload) {
    return await this.#request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload)
    });
  }

  /**
   * Procesa el cobro seguro con el token de tarjeta
   */
  async processPayment(paymentPayload) {
    return await this.#request('/payments/process', {
      method: 'POST',
      body: JSON.stringify(paymentPayload)
    });
  }

  /**
   * Inicia sesión con correo y contraseña
   */
  async login(email, password) {
    return await this.#request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  /**
   * Registra una nueva cuenta de cliente
   */
  async register(registrationData) {
    return await this.#request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(registrationData)
    });
  }
}

export const api = new ApiService();
