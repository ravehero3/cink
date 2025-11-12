export default function PaymentPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 uppercase tracking-wider">PLATBA</h1>
      
      <div className="max-w-3xl">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 uppercase">Platební metody</h2>
          <p className="text-base mb-6 leading-relaxed">
            Pro vaše pohodlí nabízíme různé způsoby platby:
          </p>
        </div>

        <div className="grid gap-6 mb-8">
          <div className="border border-black p-6">
            <h3 className="text-xl font-bold mb-3 uppercase">Platební karta</h3>
            <p className="text-base mb-2 leading-relaxed">
              Bezpečná online platba kartou přes platební bránu GoPay
            </p>
            <p className="text-sm">
              <strong>Podporované karty:</strong> Visa, Mastercard, Maestro<br />
              <strong>Zpracování:</strong> Okamžitě
            </p>
          </div>

          <div className="border border-black p-6">
            <h3 className="text-xl font-bold mb-3 uppercase">Bankovní převod</h3>
            <p className="text-base mb-2 leading-relaxed">
              Platba předem bankovním převodem
            </p>
            <p className="text-sm">
              <strong>Zpracování:</strong> Po připsání platby na účet (1-3 dny)<br />
              <strong>Poznámka:</strong> Variabilní symbol obdržíte e-mailem
            </p>
          </div>

          <div className="border border-black p-6">
            <h3 className="text-xl font-bold mb-3 uppercase">Dobírka</h3>
            <p className="text-base mb-2 leading-relaxed">
              Platba v hotovosti při převzetí zásilky
            </p>
            <p className="text-sm">
              <strong>Poplatek:</strong> 30 Kč<br />
              <strong>Zpracování:</strong> Okamžitě po objednání
            </p>
          </div>
        </div>

        <div className="border border-black p-6 bg-gray-50">
          <h3 className="text-lg font-bold mb-3 uppercase">Bezpečnost plateb</h3>
          <p className="text-base leading-relaxed">
            Všechny online platby jsou zabezpečené pomocí nejnovějších bezpečnostních protokolů. Vaše platební údaje jsou chráněny a nejsou nám přístupné.
          </p>
        </div>
      </div>
    </div>
  );
}
