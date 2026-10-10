import { Page, Locator } from '@playwright/test';

export class HeaderComponent {
  readonly page: Page;
  readonly brandLogo: Locator;
  readonly authContainer: Locator;
  readonly guestActions: Locator;
  readonly loginLink: Locator;
  readonly registerLink: Locator;
  readonly userGreeting: Locator;
  readonly userName: Locator;
  readonly logoutBtn: Locator;
  readonly openCartBtn: Locator;
  readonly cartCounter: Locator;

  constructor(page: Page) {
    this.page = page;
    this.brandLogo = page.getByTestId('brand-logo');
    this.authContainer = page.getByTestId('nav-auth-container');
    this.guestActions = page.getByTestId('nav-guest-actions');
    this.loginLink = page.getByTestId('nav-login-link');
    this.registerLink = page.getByTestId('nav-register-link');
    this.userGreeting = page.getByTestId('nav-user-greeting');
    this.userName = page.getByTestId('nav-user-name');
    this.logoutBtn = page.getByTestId('nav-logout-btn');
    this.openCartBtn = page.getByTestId('open-cart-btn');
    this.cartCounter = page.getByTestId('cart-counter');
  }

  async logout(): Promise<void> {
    await this.logoutBtn.click();
  }

  async openCart(): Promise<void> {
    await this.openCartBtn.click();
  }
}
