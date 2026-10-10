import { Page, Locator } from '@playwright/test';

export class CartDrawerComponent {
  readonly page: Page;
  readonly drawer: Locator;
  readonly closeBtn: Locator;
  readonly itemsContainer: Locator;
  readonly cartItems: Locator;
  readonly checkoutBtn: Locator;
  readonly subtotal: Locator;
  readonly total: Locator;

  constructor(page: Page) {
    this.page = page;
    this.drawer = page.getByTestId('cart-drawer');
    this.closeBtn = page.getByTestId('close-cart-btn');
    this.itemsContainer = page.getByTestId('cart-items-container');
    this.cartItems = page.getByTestId('cart-item').or(page.locator('.cart-item'));
    this.checkoutBtn = page.getByTestId('cart-checkout-btn');
    this.subtotal = page.getByTestId('cart-subtotal');
    this.total = page.getByTestId('cart-total');
  }

  async close(): Promise<void> {
    await this.closeBtn.click();
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutBtn.click();
  }
}
