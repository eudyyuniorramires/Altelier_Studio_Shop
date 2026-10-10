import { test, expect } from '../fixtures/pages';
import {
  generateNewUser,
  duplicateEmailUser,
  invalidPasswordUser,
} from '../data/testData';

test.describe('TC02-Register', () => {
  test('Register with valid credentials', async ({ registerPage }) => {
    const user = generateNewUser();
    await registerPage.registerUser(user);
    await expect(registerPage.authUser).toContainText(user.name);
  });

  test('Register with duplicate email - Should show error alert', async ({ registerPage }) => {
    await registerPage.registerUser(duplicateEmailUser);
    await expect(registerPage.errorMessage).toContainText(
      duplicateEmailUser.expectedMessage!
    );
  });

  test('Register with short password - Should show input validation error', async ({ registerPage }) => {
    await registerPage.registerUser(invalidPasswordUser);
    await expect(registerPage.errorInputPassword).toContainText(
      invalidPasswordUser.expectedMessage!
    );
  });
});
