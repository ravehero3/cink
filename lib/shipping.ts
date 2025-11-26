export const FREE_SHIPPING_THRESHOLD = 2000;
export const STANDARD_SHIPPING_COST = 79;

export function calculateShippingCost(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;
}

export function getShippingLabel(subtotal: number): string {
  const cost = calculateShippingCost(subtotal);
  return cost === 0 ? 'ZDARMA' : `${cost} Kč`;
}

export function getAmountToFreeShipping(subtotal: number): number {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return FREE_SHIPPING_THRESHOLD - subtotal;
}
