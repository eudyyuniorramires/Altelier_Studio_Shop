import { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  protected page: Page;
  readonly toastContainer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.toastContainer = page.locator('.toast-container');
  }

  /**
   * Navega a una ruta relativa en base a baseURL
   */
  async goto(path: string): Promise<void> {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  /**
   * Obtiene la URL actual del navegador
   */
  getUrl(): string {
    return this.page.url();
  }

  /**
   * Espera que un mensaje toast sea visible
   */
  async waitForToast(): Promise<void> {
    await this.toastContainer.waitFor({ state: 'visible', timeout: 5000 });
  }
}