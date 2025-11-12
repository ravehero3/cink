export default function DeliveryPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 uppercase tracking-wider">DORUČENÍ</h1>
      
      <div className="max-w-3xl">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 uppercase">Možnosti doručení</h2>
          <p className="text-base mb-6 leading-relaxed">
            Nabízíme několik možností doručení vašich objednávek:
          </p>
        </div>

        <div className="grid gap-6 mb-8">
          <div className="border border-black p-6">
            <h3 className="text-xl font-bold mb-3 uppercase">Zásilkovna</h3>
            <p className="text-base mb-2 leading-relaxed">
              Doručení na vybranou výdejní místo Zásilkovny
            </p>
            <p className="text-sm">
              <strong>Cena:</strong> 79 Kč<br />
              <strong>Doba doručení:</strong> 1-3 pracovní dny
            </p>
          </div>

          <div className="border border-black p-6">
            <h3 className="text-xl font-bold mb-3 uppercase">Česká pošta</h3>
            <p className="text-base mb-2 leading-relaxed">
              Doručení poštou na adresu
            </p>
            <p className="text-sm">
              <strong>Cena:</strong> 99 Kč<br />
              <strong>Doba doručení:</strong> 2-5 pracovních dnů
            </p>
          </div>

          <div className="border border-black p-6">
            <h3 className="text-xl font-bold mb-3 uppercase">PPL</h3>
            <p className="text-base mb-2 leading-relaxed">
              Expresní doručení kurýrem na adresu
            </p>
            <p className="text-sm">
              <strong>Cena:</strong> 129 Kč<br />
              <strong>Doba doručení:</strong> 1-2 pracovní dny
            </p>
          </div>
        </div>

        <div className="border border-black p-6 bg-gray-50">
          <h3 className="text-lg font-bold mb-3 uppercase">Důležité informace</h3>
          <ul className="list-disc list-inside space-y-2 text-base leading-relaxed">
            <li>Objednávky odeslané do 14:00 jsou zpracovány tentýž den</li>
            <li>O odeslání zásilky vás budeme informovat e-mailem</li>
            <li>Při převzetí zásilky zkontrolujte její neporušenost</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
