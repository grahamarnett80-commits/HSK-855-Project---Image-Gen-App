export interface StripeProduct {
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price: number;
  currency: string;
  currencySymbol: string;
}

export const stripeProducts: StripeProduct[] = [
  {
    priceId: 'price_1T1w3gDcuz2RhZFsyfvxcjL7',
    name: 'Image Generator - single image',
    description: 'Image Generator - single image',
    mode: 'payment',
    price: 1.00,
    currency: 'cad',
    currencySymbol: 'C$',
  },
];

export function getProductByPriceId(priceId: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.priceId === priceId);
}