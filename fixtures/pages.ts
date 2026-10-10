import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { CatalogPage } from '../pages/CatalogPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { HeaderComponent } from '../components/HeaderComponent';
import { CartDrawerComponent } from '../components/CartDrawerComponent';

type PageObjects = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  catalogPage: CatalogPage;
  checkoutPage: CheckoutPage;
  header: HeaderComponent;
  cartDrawer: CartDrawerComponent;

  // Backwards compatibility aliases
  catalogoPag: CatalogPage;
  creditCardPage: CheckoutPage;
};

export const test = base.extend<PageObjects>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },

  catalogPage: async ({ page }, use) => {
    await use(new CatalogPage(page));
  },

  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },

  header: async ({ page }, use) => {
    await use(new HeaderComponent(page));
  },

  cartDrawer: async ({ page }, use) => {
    await use(new CartDrawerComponent(page));
  },

  // Aliases for backwards compatibility
  catalogoPag: async ({ page }, use) => {
    await use(new CatalogPage(page));
  },

  creditCardPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
});

export { expect };
