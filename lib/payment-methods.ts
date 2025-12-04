export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'PAYMENT_CARD',
    name: 'Platební karta',
    description: 'Visa, Mastercard, Maestro',
    icon: 'CreditCard',
  },
  {
    id: 'BANK_ACCOUNT',
    name: 'Bankovní převod',
    description: 'Rychlý online převod',
    icon: 'Building2',
  },
  {
    id: 'GPAY',
    name: 'Google Pay',
    description: 'Platba přes Google Pay',
    icon: 'Smartphone',
  },
  {
    id: 'APPLE_PAY',
    name: 'Apple Pay',
    description: 'Platba přes Apple Pay',
    icon: 'Smartphone',
  },
];

export function getPaymentMethods(): PaymentMethod[] {
  return paymentMethods;
}

export function getPaymentMethodById(id: string): PaymentMethod | undefined {
  return paymentMethods.find((method) => method.id === id);
}
