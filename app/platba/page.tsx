export default function PaymentPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 uppercase tracking-wider text-center">PLATBA</h1>
      
      <div className="max-w-3xl mx-auto">
        <div className="mb-8" style={{ textAlign: 'center' }}>
          <h2 className="text-2xl font-bold mb-4 uppercase">Platební metody</h2>
          <p style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '19.6px', marginTop: '12px', marginBottom: '12px' }}>
            Pro vaše pohodlí nabízíme různé způsoby platby:
          </p>
        </div>

        <div className="grid gap-6 mb-8">
          <div className="border border-black p-6" style={{ textAlign: 'center' }}>
            <h3 className="text-xl font-bold mb-3 uppercase">Platební karta</h3>
            <p style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '19.6px', marginTop: '12px', marginBottom: '12px' }}>
              Bezpečná online platba kartou přes platební bránu GoPay
            </p>
            <p style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '19.6px', marginTop: '12px', marginBottom: '12px' }}>
              <strong>Podporované karty:</strong> Visa, Mastercard, Maestro<br />
              <strong>Zpracování:</strong> Okamžitě
            </p>
          </div>

          <div className="border border-black p-6" style={{ textAlign: 'center' }}>
            <h3 className="text-xl font-bold mb-3 uppercase">Bankovní převod</h3>
            <p style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '19.6px', marginTop: '12px', marginBottom: '12px' }}>
              Platba předem bankovním převodem
            </p>
            <p style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '19.6px', marginTop: '12px', marginBottom: '12px' }}>
              <strong>Zpracování:</strong> Po připsání platby na účet (1-3 dny)<br />
              <strong>Poznámka:</strong> Variabilní symbol obdržíte e-mailem
            </p>
          </div>

          <div className="border border-black p-6" style={{ textAlign: 'center' }}>
            <h3 className="text-xl font-bold mb-3 uppercase">Dobírka</h3>
            <p style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '19.6px', marginTop: '12px', marginBottom: '12px' }}>
              Platba v hotovosti při převzetí zásilky
            </p>
            <p style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '19.6px', marginTop: '12px', marginBottom: '12px' }}>
              <strong>Poplatek:</strong> 30 Kč<br />
              <strong>Zpracování:</strong> Okamžitě po objednání
            </p>
          </div>
        </div>

        <div className="border border-black p-6 bg-gray-50" style={{ textAlign: 'center' }}>
          <h3 className="text-lg font-bold mb-3 uppercase">Bezpečnost plateb</h3>
          <p style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '19.6px', marginTop: '12px', marginBottom: '12px' }}>
            Všechny online platby jsou zabezpečené pomocí nejnovějších bezpečnostních protokolů. Vaše platební údaje jsou chráněny a nejsou nám přístupné.
          </p>
        </div>
      </div>
    </div>
  );
}
