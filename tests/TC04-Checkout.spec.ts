import { test, expect } from '../fixtures/pages';
import {
  validCard,
  declineCard,
  expiredCard,
  validUser,
} from '../data/testData';

const validScenarios = [
  {
    cardNumber: validCard.cardNumber,
    cardDate: validCard.cardDate,
    cardCvc: validCard.cardCvc,
    expectedMessage: validCard.expectedMessage || '¡Pago Aprobado!',
  },
];

const invalidScenarios = [
  {
    cardNumber: declineCard.cardNumber,
    cardDate: declineCard.cardDate,
    cardCvc: declineCard.cardCvc,
    expectedError: declineCard.expectedError || 'Pago Declinado',
  },
  {
    cardNumber: expiredCard.cardNumber,
    cardDate: expiredCard.cardDate,
    cardCvc: expiredCard.cardCvc,
    expectedError: expiredCard.expectedError || 'Pago Declinado',
  },
];

test.describe('TC04-Checkout', () => {
  for (const {
    cardNumber,
    cardDate,
    cardCvc,
    expectedMessage,
  } of validScenarios) {
    test(`Checkout with valid card - ${cardNumber}`, async ({
      loginPage,
      catalogPage,
      cartDrawer,
      checkoutPage,
    }) => {
      await loginPage.loginSuccessfully(validUser.email, validUser.password);
      await catalogPage.addItemToCart();
      await expect(cartDrawer.cartItems).not.toHaveCount(0);
      await cartDrawer.proceedToCheckout();
      await checkoutPage.fillCardDetails(cardNumber, cardDate, cardCvc);
      await expect(checkoutPage.modalAlert).toBeVisible();
      await expect(checkoutPage.expectedMessage).toContainText(expectedMessage);
    });
  }

  for (const {
    cardNumber,
    cardDate,
    cardCvc,
    expectedError,
  } of invalidScenarios) {
    test(`Checkout with invalid card - ${cardNumber}`, async ({
      loginPage,
      catalogPage,
      cartDrawer,
      checkoutPage,
    }) => {
      await loginPage.loginSuccessfully(validUser.email, validUser.password);
      await catalogPage.addItemToCart();
      await expect(cartDrawer.cartItems).not.toHaveCount(0);
      await cartDrawer.proceedToCheckout();
      await checkoutPage.fillCardDetails(cardNumber, cardDate, cardCvc);
      await expect(checkoutPage.modalAlert).toBeVisible();
      await expect(checkoutPage.expectedMessage).toContainText(expectedError);
    });
  }
});
