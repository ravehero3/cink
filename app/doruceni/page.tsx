export default function DeliveryPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 uppercase tracking-wider text-center">DORUČENÍ</h1>
      
      <div className="max-w-3xl mx-auto">
        <div className="mb-8" style={{ textAlign: 'center' }}>
          <h2 className="text-2xl font-bold mb-4 uppercase">Možnosti doručení</h2>
          <p style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '19.6px', marginTop: '12px', marginBottom: '12px' }}>
            Nabízíme několik možností doručení vašich objednávek:
          </p>
        </div>

        <div className="grid gap-6 mb-8">
          <div className="border border-black p-6" style={{ textAlign: 'center' }}>
            <h3 className="text-xl font-bold mb-3 uppercase">Zásilkovna</h3>
            <p style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '19.6px', marginTop: '12px', marginBottom: '12px' }}>
              Doručení na vybranou výdejní místo Zásilkovny
            </p>
            <p style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '19.6px', marginTop: '12px', marginBottom: '12px' }}>
              <strong>Cena:</strong> 79 Kč<br />
              <strong>Doba doručení:</strong> 1-3 pracovní dny
            </p>
          </div>

          <div className="border border-black p-6" style={{ textAlign: 'center' }}>
            <h3 className="text-xl font-bold mb-3 uppercase">Česká pošta</h3>
            <p style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '19.6px', marginTop: '12px', marginBottom: '12px' }}>
              Doručení poštou na adresu
            </p>
            <p style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '19.6px', marginTop: '12px', marginBottom: '12px' }}>
              <strong>Cena:</strong> 99 Kč<br />
              <strong>Doba doručení:</strong> 2-5 pracovních dnů
            </p>
          </div>

          <div className="border border-black p-6" style={{ textAlign: 'center' }}>
            <h3 className="text-xl font-bold mb-3 uppercase">PPL</h3>
            <p style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '19.6px', marginTop: '12px', marginBottom: '12px' }}>
              Expresní doručení kurýrem na adresu
            </p>
            <p style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '19.6px', marginTop: '12px', marginBottom: '12px' }}>
              <strong>Cena:</strong> 129 Kč<br />
              <strong>Doba doručení:</strong> 1-2 pracovní dny
            </p>
          </div>
        </div>

        <div className="border border-black p-6 bg-gray-50" style={{ textAlign: 'center' }}>
          <h3 className="text-lg font-bold mb-3 uppercase">Důležité informace</h3>
          <ul className="list-disc list-inside space-y-2" style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '19.6px', marginTop: '12px', marginBottom: '12px', textAlign: 'left', display: 'inline-block' }}>
            <li>Objednávky odeslané do 14:00 jsou zpracovány tentýž den</li>
            <li>O odeslání zásilky vás budeme informovat e-mailem</li>
            <li>Při převzetí zásilky zkontrolujte její neporušenost</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
