export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white relative">
      {/* Left vertical line - starts at top (header padding handled by body) */}
      <div className="absolute left-1/4 w-px bg-black z-0" style={{ top: 0, bottom: 0 }} />
      
      {/* Right vertical line - starts at top (header padding handled by body) */}
      <div className="absolute right-1/4 w-px bg-black z-0" style={{ top: 0, bottom: 0 }} />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
        <div style={{ width: '33.33%' }}>
          <h1 
            className="uppercase mb-12"
            style={{
              fontFamily: '"Roboto Condensed", "Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '20px',
              fontWeight: 700,
              letterSpacing: '0.05em'
            }}
          >
            ČASTO KLADENÉ DOTAZY
          </h1>
          
          <div>
            <div className="mb-8 border-b border-black pb-6">
              <h2 
                className="uppercase mb-3"
                style={{
                  fontFamily: '"Roboto Condensed", "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '16px',
                  fontWeight: 700,
                  letterSpacing: '0.05em'
                }}
              >
                Jak mohu objednat?
              </h2>
              <p 
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '1.6'
                }}
              >
                Objednávku můžete provést přímo na našem e-shopu. Stačí si vybrat produkty, vložit je do košíku a postupovat podle pokynů v procesu objednávky.
              </p>
            </div>

            <div className="mb-8 border-b border-black pb-6">
              <h2 
                className="uppercase mb-3"
                style={{
                  fontFamily: '"Roboto Condensed", "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '16px',
                  fontWeight: 700,
                  letterSpacing: '0.05em'
                }}
              >
                Jaké máte platební metody?
              </h2>
              <p 
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '1.6'
                }}
              >
                Akceptujeme platby kartou a bankovním převodem. Více informací najdete na stránce platby.
              </p>
            </div>

            <div className="mb-8 border-b border-black pb-6">
              <h2 
                className="uppercase mb-3"
                style={{
                  fontFamily: '"Roboto Condensed", "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '16px',
                  fontWeight: 700,
                  letterSpacing: '0.05em'
                }}
              >
                Jak dlouho trvá doručení?
              </h2>
              <p 
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '1.6'
                }}
              >
                Standardní doba doručení je 2-5 pracovních dnů od potvrzení objednávky. Více informací najdete na stránce doručení.
              </p>
            </div>

            <div className="mb-8 pb-6">
              <h2 
                className="uppercase mb-3"
                style={{
                  fontFamily: '"Roboto Condensed", "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '16px',
                  fontWeight: 700,
                  letterSpacing: '0.05em'
                }}
              >
                Mohu zboží vrátit?
              </h2>
              <p 
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '1.6'
                }}
              >
                Ano, zboží můžete vrátit do 14 dnů od převzetí. Více informací najdete na stránce vrácení zboží.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
