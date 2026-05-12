export const FREE_SHIPPING_THRESHOLD = 2000;
export const ZASILKOVNA_COST = 89;
export const PPL_ADDRESS_COST = 99;
export const PPL_PARCELSHOP_COST = 89;

export function calculateShippingCost(subtotal: number, method: string = 'zasilkovna'): number {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  
  switch (method) {
    case 'ppl_address':
      return PPL_ADDRESS_COST;
    case 'ppl_parcelshop':
      return PPL_PARCELSHOP_COST;
    case 'zasilkovna':
    default:
      return ZASILKOVNA_COST;
  }
}

export function getShippingLabel(subtotal: number, method: string = 'zasilkovna'): string {
  const cost = calculateShippingCost(subtotal, method);
  return cost === 0 ? 'ZDARMA' : `${cost} Kč`;
}

export function getAmountToFreeShipping(subtotal: number): number {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return FREE_SHIPPING_THRESHOLD - subtotal;
}
