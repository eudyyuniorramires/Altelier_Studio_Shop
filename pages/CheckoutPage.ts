import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { PaymentCardData, ShippingData } from '../data/types';

export class CheckoutPage extends BasePage {
  // Datos de Envío
  readonly inputName: Locator;
  readonly inputEmail: Locator;
  readonly inputAddress: Locator;
  readonly inputCity: Locator;
  readonly inputZip: Locator;

  // Datos de Tarjeta
  readonly inputCardNumber: Locator;
  readonly inputCardDate: Locator;
  readonly inputCardCvc: Locator;
  readonly btnPay: Locator;
  readonly cardErrors: Locator;

  // Botón desde el carrito drawer (para compatibilidad)
  readonly btnPayNow: Locator;

  // Alertas y Confirmación
  readonly modalAlert: Locator;
  readonly expectedMessage: Locator;
  readonly errorMessage: Locator;
  readonly paymentSuccessCard: Locator;
  readonly successOrderNumber: Locator;
  readonly backToCatalogBtn: Locator;

  constructor(page: Page) {
    super(page);

    // Formulario de Envío
    this.inputName = page.getByTestId('checkout-name');
    this.inputEmail = page.getByTestId('checkout-email');
    this.inputAddress = page.getByTestId('checkout-address');
    this.inputCity = page.getByTestId('checkout-city');
    this.inputZip = page.getByTestId('checkout-zip');

    // Formulario de Pago
    this.inputCardNumber = page.getByTestId('card-number');
    this.inputCardDate = page.getByTestId('card-expiry');
    this.inputCardCvc = page.getByTestId('card-cvc');
    this.btnPay = page.getByTestId('btn-pay-now');
    this.cardErrors = page.getByTestId('card-errors');

    // Botón de checkout desde carrito
    this.btnPayNow = page.getByTestId('cart-checkout-btn');

    // Feedback visual y alertas
    this.modalAlert = page.locator('.toast-container');
    this.expectedMessage = page.locator('.toast__title');
    this.errorMessage = this.cardErrors;

    // Estado de éxito
    this.paymentSuccessCard = page.getByTestId('payment-success-card');
    this.successOrderNumber = page.getByTestId('success-order-number');
    this.backToCatalogBtn = page.getByTestId('back-to-catalog-btn');
  }

  async open(): Promise<void> {
    await this.goto('/checkout.html');
  }

  async fillCardDetails(cardNumber: string, cardDate: string, cardCvc: string): Promise<void> {
    await this.inputCardNumber.fill(cardNumber);
    await this.inputCardDate.fill(cardDate);
    await this.inputCardCvc.fill(cardCvc);
    await this.btnPay.click();
  }

  async fillPayment(card: PaymentCardData): Promise<void> {
    await this.fillCardDetails(card.cardNumber, card.cardDate, card.cardCvc);
  }

  async fillShippingDetails(shipping: ShippingData): Promise<void> {
    await this.inputName.fill(shipping.name);
    await this.inputEmail.fill(shipping.email);
    await this.inputAddress.fill(shipping.address);
    await this.inputCity.fill(shipping.city);
    await this.inputZip.fill(shipping.postalCode);
  }
}

// Backwards compatibility alias
export { CheckoutPage as CreditCardPage };
