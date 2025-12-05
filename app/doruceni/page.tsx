export default function DeliveryPage() {
  return (
    <div className="min-h-screen bg-white relative">
      {/* Left vertical line - starts at top (header padding handled by body) */}
      <div className="hidden md:block absolute left-1/4 w-px bg-black z-0" style={{ top: 0, bottom: 0 }} />
      
      {/* Right vertical line - starts at top (header padding handled by body) */}
      <div className="hidden md:block absolute right-1/4 w-px bg-black z-0" style={{ top: 0, bottom: 0 }} />

      {/* Main content above the line */}
      <div className="relative z-10 flex flex-col items-center pb-16" style={{ paddingTop: '64px' }}>
        <h1 
          className="uppercase text-center" 
          style={{ 
            fontFamily: '"Roboto Condensed", "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '20px',
            fontWeight: 700,
            letterSpacing: '0.05em',
            marginBottom: '8px'
          }}
        >
          DORUČENÍ
        </h1>

        <p 
          className="text-center px-4 md:px-0 w-full max-w-[90%] md:max-w-[33.33%]"
          style={{
            fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '1.6',
            marginBottom: '24px'
          }}
        >
          Nabízíme rychlé a spolehlivé doručení po celé České republice.
        </p>

        <div className="w-full flex flex-col items-center px-4 md:px-0">
          <div className="w-full md:w-1/3">
            <div style={{ marginBottom: '24px' }}>
              <h2 
                className="uppercase"
                style={{
                  fontFamily: '"Roboto Condensed", "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '16px',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  marginBottom: '8px'
                }}
              >
                Doprava zdarma
              </h2>
              <p 
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '1.6'
                }}
              >
                Při objednávce nad 2000 Kč je doprava zdarma. U objednávek pod tuto částku účtujeme poštovné dle zvoleného způsobu doručení.
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h2 
                className="uppercase"
                style={{
                  fontFamily: '"Roboto Condensed", "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '16px',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  marginBottom: '8px'
                }}
              >
                Doba doručení
              </h2>
              <p 
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '1.6'
                }}
              >
                Standardní doba doručení je 2-5 pracovních dnů od potvrzení objednávky. Objednávky přijaté do 12:00 jsou obvykle expedovány ještě tentýž den.
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h2 
                className="uppercase"
                style={{
                  fontFamily: '"Roboto Condensed", "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '16px',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  marginBottom: '8px'
                }}
              >
                Zásilkovna
              </h2>
              <p 
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '1.6'
                }}
              >
                Vaši objednávku si můžete vyzvednout na kterémkoliv výdejním místě Zásilkovny. Vyberte si z více než 7000 výdejních míst po celé České republice. Zásilka bude připravena k vyzvednutí do 2-3 pracovních dnů.
              </p>
            </div>

            <div 
              className="border border-black p-6 bg-white"
              style={{ borderRadius: '4px' }}
            >
              <h3 
                className="uppercase mb-3 text-center"
                style={{
                  fontFamily: '"Roboto Condensed", "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.05em'
                }}
              >
                Kontakt
              </h3>
              <p 
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '1.6'
                }}
              >
                V případě dotazů ohledně doručení nás kontaktujte na e-mailu: ufosport@mail.com
              </p>
            </div>
          </div>
        </div>

        {/* Horizontal line 40px below the rectangle box */}
        <div className="w-full h-px bg-black" style={{ marginTop: '40px' }} />
      </div>
    </div>
  );
}
