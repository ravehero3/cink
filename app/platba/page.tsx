import PageFrame from '@/components/PageFrame';

export default function PaymentPage() {
  return (
    <PageFrame>
      <div className="container mx-auto px-4 py-16">
        <h1 
          className="uppercase text-center mb-8"
          style={{
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '28px',
            fontWeight: 700,
            letterSpacing: '0.05em'
          }}
        >
          PLATBA
        </h1>
        
        <div className="max-w-3xl mx-auto">
          <div className="mb-12 text-center">
            <h2 
              className="uppercase mb-4"
              style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '20px',
                fontWeight: 700,
                letterSpacing: '0.05em'
              }}
            >
              Platební metody
            </h2>
            <p 
              style={{
                fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: '1.6'
              }}
            >
              Pro vaše pohodlí nabízíme různé způsoby platby:
            </p>
          </div>

          <div className="grid gap-8 mb-12">
            <div className="border-2 border-black p-6">
              <h3 
                className="uppercase mb-3 text-center"
                style={{
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '16px',
                  fontWeight: 700,
                  letterSpacing: '0.05em'
                }}
              >
                Platební karta
              </h3>
              <p 
                className="mb-3"
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '1.6'
                }}
              >
                Bezpečná online platba kartou přes platební bránu GoPay
              </p>
              <p 
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '1.6'
                }}
              >
                <strong>Podporované karty:</strong> Visa, Mastercard, Maestro<br />
                <strong>Zpracování:</strong> Okamžitě
              </p>
            </div>

            <div className="border-2 border-black p-6">
              <h3 
                className="uppercase mb-3 text-center"
                style={{
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '16px',
                  fontWeight: 700,
                  letterSpacing: '0.05em'
                }}
              >
                Bankovní převod
              </h3>
              <p 
                className="mb-3"
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '1.6'
                }}
              >
                Platba předem bankovním převodem
              </p>
              <p 
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '1.6'
                }}
              >
                <strong>Zpracování:</strong> Po připsání platby na účet (1-3 dny)<br />
                <strong>Poznámka:</strong> Variabilní symbol obdržíte e-mailem
              </p>
            </div>

            <div className="border-2 border-black p-6">
              <h3 
                className="uppercase mb-3 text-center"
                style={{
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '16px',
                  fontWeight: 700,
                  letterSpacing: '0.05em'
                }}
              >
                Dobírka
              </h3>
              <p 
                className="mb-3"
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '1.6'
                }}
              >
                Platba v hotovosti při převzetí zásilky
              </p>
              <p 
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '1.6'
                }}
              >
                <strong>Poplatek:</strong> 30 Kč<br />
                <strong>Zpracování:</strong> Okamžitě po objednání
              </p>
            </div>
          </div>

          <div className="border-2 border-black p-6 bg-white">
            <h3 
              className="uppercase mb-3 text-center"
              style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '0.05em'
              }}
            >
              Bezpečnost plateb
            </h3>
            <p 
              style={{
                fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: '1.6'
              }}
            >
              Všechny online platby jsou zabezpečené pomocí nejnovějších bezpečnostních protokolů. Vaše platební údaje jsou chráněny a nejsou nám přístupné.
            </p>
          </div>
        </div>
      </div>
    </PageFrame>
  );
}
