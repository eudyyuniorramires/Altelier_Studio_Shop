import { test, expect } from '../fixtures/pages';
import { validUser, vipUser, adminUser } from '../data/testData';

test.describe('TC03-CatalogAccess', () => {
  test('Access to catalog page and add item without login', async ({
    catalogPage,
    cartDrawer,
  }) => {
    await catalogPage.addItemToCart();
    await expect(cartDrawer.cartItems).not.toHaveCount(0);
    await expect(catalogPage.modalAlert).toBeVisible();
  });

  const validScenarios = [
    { email: validUser.email, password: validUser.password, user: validUser.userName },
    { email: vipUser.email, password: vipUser.password, user: vipUser.userName },
    { email: adminUser.email, password: adminUser.password, user: adminUser.userName },
  ];

  for (const { email, password, user } of validScenarios) {
    test(`Access to catalog page and add item with Login - ${user}`, async ({
      loginPage,
      catalogPage,
      cartDrawer,
    }) => {
      await loginPage.loginSuccessfully(email, password);
      await catalogPage.addItemToCart();
      await expect(cartDrawer.cartItems).not.toHaveCount(0);
      await expect(catalogPage.modalAlert).toBeVisible();
    });
  }
});
