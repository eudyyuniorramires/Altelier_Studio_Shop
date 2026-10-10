export interface UserCredentials {
  email: string;
  password: string;
  userName: string;
}

export interface RegisterUserData {
  name: string;
  email: string;
  password: string;
  address: string;
  city: string;
  postal: string;
  expectedMessage?: string;
}

export interface PaymentCardData {
  cardNumber: string;
  cardDate: string;
  cardCvc: string;
  expectedMessage?: string;
  expectedError?: string;
}

export interface ShippingData {
  name: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
}
