import { UserCredentials, PaymentCardData, RegisterUserData } from './types';

export const validUser: UserCredentials = {
  email: 'standard_user@atelier.com',
  password: 'Secret123!',
  userName: 'Sofía Martínez',
};

export const vipUser: UserCredentials = {
  email: 'vip_user@atelier.com',
  password: 'Secret123!',
  userName: 'Valentina Rossi',
};

export const adminUser: UserCredentials = {
  email: 'admin_user@atelier.com',
  password: 'AdminPass123!',
  userName: 'Lucas Administrador',
};

export const invalidUser: UserCredentials = {
  email: 'standard_user@atelier.com',
  password: 'ClaveInvalida999',
  userName: 'Sofía Martínez',
};

export const lockedUser: UserCredentials = {
  email: 'locked_user@atelier.com',
  password: 'Secret123!',
  userName: 'Carlos Benítez',
};

export const userDoesNotExist: UserCredentials = {
  email: 'no_existe_qa@atelier.com',
  password: 'Secret123!',
  userName: 'N/A',
};
// Alias for backward compatibility
export const UserDoesNotExist = userDoesNotExist;

export const badEmailFormat: UserCredentials = {
  email: 'standard_useratelier.com',
  password: 'Secret123!',
  userName: 'Sofía Martínez',
};

export const emptyPassword: UserCredentials = {
  email: 'standard_user@atelier.com',
  password: '',
  userName: 'N/A',
};

export const validCard: PaymentCardData = {
  cardNumber: '4242 4242 4242 4242',
  cardDate: '12/28',
  cardCvc: '123',
  expectedMessage: '¡Pago Aprobado!',
};

export const declineCard: PaymentCardData = {
  cardNumber: '4000 0000 0000 0002',
  cardDate: '12/28',
  cardCvc: '123',
  expectedError: 'Pago Declinado',
};

export const expiredCard: PaymentCardData = {
  cardNumber: '4000 0000 0000 0069',
  cardDate: '12/28',
  cardCvc: '123',
  expectedError: 'Pago Declinado',
};

export const generateNewUser = (): RegisterUserData => ({
  name: 'Lucía Méndez',
  email: `lucia.mendez.qa.${Date.now()}@atelier.com`,
  password: 'NuevaPass123!',
  address: 'Av. Santa Fe 2341',
  city: 'CABA',
  postal: 'C1059',
  expectedMessage: 'Registro exitoso. Sesión iniciada automáticamente.',
});

export const duplicateEmailUser: RegisterUserData = {
  name: 'Lucía Méndez',
  email: 'standard_user@atelier.com',
  password: 'NuevaPass123!',
  address: 'Av. Santa Fe 2341',
  city: 'CABA',
  postal: 'C1059',
  expectedMessage: 'El correo electrónico ya se encuentra registrado.',
};

export const invalidPasswordUser: RegisterUserData = {
  name: 'Lucía Méndez',
  email: `lucia.shortpass.${Date.now()}@atelier.com`,
  password: '12345',
  address: 'Av. Santa Fe 2341',
  city: 'CABA',
  postal: 'C1059',
  expectedMessage: 'La contraseña debe tener mínimo 6 caracteres',
};
