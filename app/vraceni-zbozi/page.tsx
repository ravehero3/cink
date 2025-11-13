export default function ReturnsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 uppercase tracking-wider text-center">VRÁCENÍ ZBOŽÍ</h1>
      
      <div className="max-w-3xl mx-auto">
        <div className="mb-8" style={{ textAlign: 'center' }}>
          <h2 className="text-2xl font-bold mb-4 uppercase">Právo na odstoupení od smlouvy</h2>
          <p style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '19.6px', marginTop: '12px', marginBottom: '12px' }}>
            V souladu s § 1829 odst. 1 zákona č. 89/2012 Sb., občanský zákoník, máte právo odstoupit od smlouvy bez udání důvodu do 14 dnů od převzetí zboží.
          </p>
        </div>

        <div className="mb-8" style={{ textAlign: 'center' }}>
          <h2 className="text-2xl font-bold mb-4 uppercase">Jak vrátit zboží?</h2>
          <ol className="list-decimal list-inside space-y-3" style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '19.6px', textAlign: 'left', display: 'inline-block' }}>
            <li>Kontaktujte nás na e-mailu ufosport@mail.com s číslem objednávky</li>
            <li>Zabalte zboží v originálním obalu (pokud je to možné)</li>
            <li>Přiložte kopii faktury nebo dokladu o koupi</li>
            <li>Zašlete zboží na adresu: Třebechovice pod Orebem</li>
          </ol>
        </div>

        <div className="mb-8" style={{ textAlign: 'center' }}>
          <h2 className="text-2xl font-bold mb-4 uppercase">Podmínky vrácení</h2>
          <ul className="list-disc list-inside space-y-2" style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '19.6px', textAlign: 'left', display: 'inline-block' }}>
            <li>Zboží musí být nepoužité a v původním stavu</li>
            <li>Zboží musí být kompletní včetně všech součástí a příslušenství</li>
            <li>Doporučujeme použít pojištěnou zásilku</li>
          </ul>
        </div>

        <div className="border border-black p-6 bg-gray-50" style={{ textAlign: 'center' }}>
          <h3 className="text-lg font-bold mb-3 uppercase">Vrácení peněz</h3>
          <p style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '19.6px', marginTop: '12px', marginBottom: '12px' }}>
            Peníze vám vrátíme do 14 dnů od doručení vráceného zboží na náš sklad, a to stejným způsobem, jakým jste platbu provedli.
          </p>
        </div>
      </div>
    </div>
  );
}
