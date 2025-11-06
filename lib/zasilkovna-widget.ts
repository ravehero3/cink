export interface ZasilkovnaPoint {
  id: string;
  name: string;
  place: string;
  street: string;
  zip: string;
}

export function openZasilkovnaWidget(
  apiKey: string,
  onSelect: (point: ZasilkovnaPoint) => void
): void {
  if (typeof window === 'undefined') {
    console.error('Zásilkovna widget can only be used in browser');
    return;
  }

  if (!(window as any).Packeta) {
    console.error('Zásilkovna widget script not loaded');
    return;
  }

  (window as any).Packeta.Widget.pick(apiKey, (point: ZasilkovnaPoint) => {
    if (point) {
      onSelect({
        id: point.id,
        name: point.name,
        place: point.place,
        street: point.street,
        zip: point.zip,
      });
    }
  }, {
    country: 'cz',
    language: 'cs',
  });
}
