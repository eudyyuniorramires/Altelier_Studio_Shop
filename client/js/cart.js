import { CONFIG } from './config.js';

/**
 * Gestor del Carrito de Compras en Vanilla JS (ES6+) con persistencia en LocalStorage
 */
class CartStore {
  constructor() {
    this.storageKey = CONFIG.STORAGE_KEYS.CART;
    this.items = this.#loadFromStorage();
  }

  /**
   * Carga los ítems serializados desde localStorage
   */
  #loadFromStorage() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error al leer el carrito de localStorage:', e);
      return [];
    }
  }

  /**
   * Guarda los ítems en localStorage y emite el evento de cambio
   */
  #saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
      this.#notifyListeners();
    } catch (e) {
      console.error('Error al guardar el carrito en localStorage:', e);
    }
  }

  /**
   * Emite un CustomEvent para actualizar la UI en cualquier pantalla
   */
  #notifyListeners() {
    const event = new CustomEvent('cart:updated', {
      detail: {
        items: this.items,
        totalCount: this.getItemCount(),
        subtotal: this.getSubtotal()
      }
    });
    window.dispatchEvent(event);
  }

  /**
   * Genera un identificador único basado en el ID del producto, talla y color seleccionado
   */
  #generateCartItemId(productId, size, color) {
    return `${productId}_${size || 'default'}_${color || 'default'}`;
  }

  /**
   * Agrega un producto con sus variantes (talla, color) al carrito
   */
  addItem(product, selectedSize, selectedColor, quantity = 1) {
    const cartItemId = this.#generateCartItemId(product.id, selectedSize, selectedColor);
    const existingIndex = this.items.findIndex(item => item.cartItemId === cartItemId);

    if (existingIndex > -1) {
      // Si ya existía, suma la cantidad
      this.items[existingIndex].quantity += quantity;
    } else {
      // Si es nuevo, lo añade a la colección
      this.items.push({
        cartItemId,
        productId: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        category: product.category,
        selectedSize: selectedSize || (product.availableSizes && product.availableSizes[0]) || 'M',
        selectedColor: selectedColor || (product.availableColors && product.availableColors[0]) || '#111827',
        quantity: quantity
      });
    }

    this.#saveToStorage();
    return this.items;
  }

  /**
   * Modifica la cantidad de un ítem
   */
  updateQuantity(cartItemId, newQuantity) {
    const index = this.items.findIndex(i => i.cartItemId === cartItemId);
    if (index === -1) return;

    if (newQuantity <= 0) {
      this.removeItem(cartItemId);
    } else {
      this.items[index].quantity = newQuantity;
      this.#saveToStorage();
    }
  }

  /**
   * Elimina un ítem específico del carrito
   */
  removeItem(cartItemId) {
    this.items = this.items.filter(i => i.cartItemId !== cartItemId);
    this.#saveToStorage();
  }

  /**
   * Vacía todo el contenido del carrito (tras checkout exitoso)
   */
  clear() {
    this.items = [];
    this.#saveToStorage();
  }

  /**
   * Retorna los ítems actuales
   */
  getItems() {
    return [...this.items];
  }

  /**
   * Calcula el número total de unidades en el carrito
   */
  getItemCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Calcula el subtotal monetario de todos los ítems
   */
  getSubtotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }
}

export const cart = new CartStore();
