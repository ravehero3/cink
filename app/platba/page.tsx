import Accordion from '@/components/Accordion';

export default function PaymentPage() {
  const paymentItems = [
    {
      title: 'Platební karta',
      content: (
        <div>
          <p className="mb-3" style={{
            fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '1.6'
          }}>
            Bezpečná online platba kartou přes platební bránu GoPay
          </p>
          <p style={{
            fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '1.6'
          }}>
            <strong>Podporované karty:</strong> Visa, Mastercard, Maestro<br />
            <strong>Zpracování:</strong> Okamžitě
          </p>
        </div>
      )
    },
    {
      title: 'Bankovní převod',
      content: (
        <div>
          <p className="mb-3" style={{
            fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '1.6'
          }}>
            Platba předem bankovním převodem
          </p>
          <p style={{
            fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '1.6'
          }}>
            <strong>Zpracování:</strong> Po připsání platby na účet (1-3 dny)<br />
            <strong>Poznámka:</strong> Variabilní symbol obdržíte e-mailem
          </p>
        </div>
      )
    },
    {
      title: 'Bezpečnost plateb',
      content: (
        <p style={{
          fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
          fontSize: '14px',
          fontWeight: 400,
          lineHeight: '1.6'
        }}>
          Všechny online platby jsou zabezpečené pomocí nejnovějších bezpečnostních protokolů. Vaše platební údaje jsou chráněny a nejsou nám přístupné.
        </p>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-white relative">
      {/* Left vertical line - starts at top (header padding handled by body) */}
      <div className="absolute left-1/4 w-px bg-black z-0" style={{ top: 0, bottom: 0 }} />
      
      {/* Right vertical line - starts at top (header padding handled by body) */}
      <div className="absolute right-1/4 w-px bg-black z-0" style={{ top: 0, bottom: 0 }} />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center" style={{ paddingTop: '64px', paddingBottom: '40px' }}>
        <h1 
          className="uppercase text-center mb-12"
          style={{
            fontFamily: '"Roboto Condensed", "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '20px',
            fontWeight: 700,
            letterSpacing: '0.05em'
          }}
        >
          PLATBA
        </h1>
        
        <div style={{ width: '33.33%' }}>
          <Accordion items={paymentItems} />
        </div>
      </div>
    </div>
  );
}
