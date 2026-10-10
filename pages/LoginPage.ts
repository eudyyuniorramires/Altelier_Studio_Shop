import { BasePage } from './BasePage';
import { Page, Locator } from '@playwright/test';

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly btnLogin: Locator;
  readonly userAuth: Locator;
  readonly errorMessage: Locator;
  readonly errorEmail: Locator;
  readonly errorPassword: Locator;
  readonly redirectNotice: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByTestId('login-email');
    this.passwordInput = page.getByTestId('login-password');
    this.btnLogin = page.getByTestId('login-submit-btn');
    this.userAuth = page.getByTestId('nav-user-name');
    this.errorMessage = page.getByTestId('login-error-alert');
    this.errorEmail = page.getByTestId('error-email');
    this.errorPassword = page.getByTestId('error-password');
    this.redirectNotice = page.getByTestId('auth-redirect-notice');
  }

  /**
   * Completa el formulario de inicio de sesión y hace clic en acceder
   */
  async login(email: string, password: string): Promise<void> {
    await this.goto('/login.html');
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.btnLogin.click();
  }

  /**
   * Inicia sesión y espera a que la redirección post-login termine (garantizando persistencia de sesión)
   */
  async loginSuccessfully(email: string, password: string): Promise<void> {
    await this.login(email, password);
    await this.page.waitForURL((url) => !url.pathname.includes('login.html'), { timeout: 10000 });
  }
}