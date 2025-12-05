export default function CookiesPage() {
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
            marginBottom: '24px'
          }}
        >
          ZÁSADY POUŽÍVÁNÍ SOUBORŮ COOKIE
        </h1>

        <div className="w-full flex flex-col items-center">
          <div style={{ width: '33.33%' }}>
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
                Co jsou cookies?
              </h2>
              <p 
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '1.6'
                }}
              >
                Cookies jsou malé textové soubory, které se ukládají do vašeho zařízení při návštěvě webových stránek. Slouží k zajištění správné funkce webu a zlepšení uživatelského zážitku.
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
                Jaké cookies používáme?
              </h2>
              
              <div style={{ marginBottom: '16px' }}>
                <h3 
                  className="uppercase"
                  style={{
                    fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '13px',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    marginBottom: '4px'
                  }}
                >
                  Nezbytné cookies
                </h3>
                <p 
                  style={{
                    fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    lineHeight: '1.6'
                  }}
                >
                  Tyto cookies jsou nutné pro základní funkčnost webu, jako je přihlášení uživatele nebo nákupní košík. Bez těchto cookies web nemůže správně fungovat.
                </p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <h3 
                  className="uppercase"
                  style={{
                    fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '13px',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    marginBottom: '4px'
                  }}
                >
                  Analytické cookies
                </h3>
                <p 
                  style={{
                    fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    lineHeight: '1.6'
                  }}
                >
                  Pomáhají nám porozumět tomu, jak návštěvníci používají náš web. Shromažďujeme anonymní data o návštěvnosti a chování uživatelů.
                </p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <h3 
                  className="uppercase"
                  style={{
                    fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '13px',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    marginBottom: '4px'
                  }}
                >
                  Marketingové cookies
                </h3>
                <p 
                  style={{
                    fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    lineHeight: '1.6'
                  }}
                >
                  Používají se k zobrazování relevantních reklam a měření efektivity reklamních kampaní.
                </p>
              </div>
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
                Jak spravovat cookies?
              </h2>
              <p 
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '1.6'
                }}
              >
                Svůj souhlas s používáním cookies můžete kdykoli změnit v nastavení cookies. Cookies můžete také zakázat v nastavení vašeho prohlížeče.
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
                Odmítnutí cookies
              </h3>
              <p 
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '1.6'
                }}
              >
                Pokud odmítnete cookies, některé funkce webu nemusí fungovat správně. Nezbytné cookies budou použity vždy, protože jsou nutné pro základní fungování webu.
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
