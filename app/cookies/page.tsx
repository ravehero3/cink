import PageFrame from '@/components/PageFrame';

export default function CookiesPage() {
  return (
    <PageFrame>
      <div 
        className="py-16"
        style={{
          marginLeft: 'calc(33.33% - 32px)',
          marginRight: 'calc(33.33% - 32px)'
        }}
      >
        <h1 
          className="uppercase text-center mb-8"
          style={{
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '28px',
            fontWeight: 700,
            letterSpacing: '0.05em'
          }}
        >
          ZÁSADY POUŽÍVÁNÍ SOUBORŮ COOKIE
        </h1>
        
        <div>
          <div className="mb-12">
            <h2 
              className="uppercase mb-4"
              style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '20px',
                fontWeight: 700,
                letterSpacing: '0.05em'
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

          <div className="mb-12">
            <h2 
              className="uppercase mb-4"
              style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '20px',
                fontWeight: 700,
                letterSpacing: '0.05em'
              }}
            >
              Jaké cookies používáme?
            </h2>
            
            <div className="space-y-8">
              <div className="border-l-4 border-black pl-6">
                <h3 
                  className="uppercase mb-2"
                  style={{
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '14px',
                    fontWeight: 700,
                    letterSpacing: '0.05em'
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

              <div className="border-l-4 border-black pl-6">
                <h3 
                  className="uppercase mb-2"
                  style={{
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '14px',
                    fontWeight: 700,
                    letterSpacing: '0.05em'
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

              <div className="border-l-4 border-black pl-6">
                <h3 
                  className="uppercase mb-2"
                  style={{
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: '14px',
                    fontWeight: 700,
                    letterSpacing: '0.05em'
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
          </div>

          <div className="mb-12">
            <h2 
              className="uppercase mb-4"
              style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '20px',
                fontWeight: 700,
                letterSpacing: '0.05em'
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
    </PageFrame>
  );
}
