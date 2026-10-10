import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class CatalogPage extends BasePage {
  readonly productCards: Locator;
  readonly btnAddToCart: Locator;
  readonly btnCloseCart: Locator;
  readonly btnSize: Locator;
  readonly btnColor: Locator;
  readonly cartItems: Locator;
  readonly modalAlert: Locator;

  // Aliases for backwards compatibility with previous tests
  readonly item: Locator;
  readonly btnAddTocart: Locator;
  readonly btnCloseCard: Locator;
  readonly itemCard: Locator;

  constructor(page: Page) {
    super(page);

    this.productCards = page.getByTestId('product-card');
    this.btnAddToCart = page.getByTestId('add-to-cart-btn');
    this.btnCloseCart = page.getByTestId('close-cart-btn');
    this.btnSize = page.locator('.product-card__size-btn');
    this.btnColor = page.locator('.product-card__color-btn');
    this.cartItems = page.getByTestId('cart-item').or(page.locator('.cart-item'));
    this.modalAlert = page.locator('.toast-container');

    // Backwards compatibility bindings
    this.item = this.productCards;
    this.btnAddTocart = this.btnAddToCart;
    this.btnCloseCard = this.btnCloseCart;
    this.itemCard = this.cartItems;
  }

  /**
   * Navega a la página de catálogo usando ruta relativa
   */
  async open(): Promise<void> {
    await this.goto('/');
    // Esperar a que los productos se carguen en el DOM
    await this.productCards.first().waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Añade una prenda con stock al carrito seleccionando su talle y color
   */
  async addItemToCart(): Promise<void> {
    // Si no estamos en la página principal, navegar a ella
    if (!this.page.url().includes('index.html') && this.page.url() !== 'http://localhost:5000/') {
      await this.open();
    } else {
      await this.productCards.first().waitFor({ state: 'visible', timeout: 10000 });
    }

    // Buscar una tarjeta con stock disponible (el botón no debe estar deshabilitado)
    const inStockCard = this.productCards
      .filter({
        has: this.page.locator('[data-testid="add-to-cart-btn"]:not([disabled])'),
      })
      .first();

    // Seleccionar talle y color dentro de esa tarjeta específica
    const sizeBtn = inStockCard.locator('.product-card__size-btn').first();
    if (await sizeBtn.isVisible()) {
      await sizeBtn.click();
    }

    const colorBtn = inStockCard.locator('.product-card__color-btn').first();
    if (await colorBtn.isVisible()) {
      await colorBtn.click();
    }

    // Hacer clic en Añadir al Carrito de esa tarjeta
    const addBtn = inStockCard.getByTestId('add-to-cart-btn');
    await addBtn.click();
  }

  // Alias para mantener compatibilidad con métodos previos
  async addItemTocart(): Promise<void> {
    await this.addItemToCart();
  }
}

// Backwards compatibility export
export { CatalogPage as CatalogoPage };