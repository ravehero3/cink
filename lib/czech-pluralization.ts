export function getCzechProductPlural(count: number): string {
  if (count === 1) {
    return 'produkt';
  } else if (count >= 2 && count <= 4) {
    return 'produkty';
  } else {
    return 'produktů';
  }
}

export function getCzechColorPlural(count: number): string {
  if (count === 1) {
    return 'barva';
  } else if (count >= 2 && count <= 4) {
    return 'barvy';
  } else {
    return 'barev';
  }
}
