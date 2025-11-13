export default function CookiesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 uppercase tracking-wider text-center">ZÁSADY POUŽÍVÁNÍ SOUBORŮ COOKIE</h1>
      
      <div className="max-w-3xl mx-auto">
        <div className="mb-8" style={{ textAlign: 'center' }}>
          <h2 className="text-2xl font-bold mb-4 uppercase">Co jsou cookies?</h2>
          <p style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '19.6px', marginTop: '12px', marginBottom: '12px' }}>
            Cookies jsou malé textové soubory, které se ukládají do vašeho zařízení při návštěvě webových stránek. Slouží k zajištění správné funkce webu a zlepšení uživatelského zážitku.
          </p>
        </div>

        <div className="mb-8" style={{ textAlign: 'center' }}>
          <h2 className="text-2xl font-bold mb-4 uppercase">Jaké cookies používáme?</h2>
          
          <div className="space-y-6">
            <div className="border-l-4 border-black pl-4">
              <h3 className="text-lg font-bold mb-2 uppercase">Nezbytné cookies</h3>
              <p style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '19.6px', marginTop: '12px', marginBottom: '12px' }}>
                Tyto cookies jsou nutné pro základní funkčnost webu, jako je přihlášení uživatele nebo nákupní košík. Bez těchto cookies web nemůže správně fungovat.
              </p>
            </div>

            <div className="border-l-4 border-black pl-4">
              <h3 className="text-lg font-bold mb-2 uppercase">Analytické cookies</h3>
              <p style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '19.6px', marginTop: '12px', marginBottom: '12px' }}>
                Pomáhají nám porozumět tomu, jak návštěvníci používají náš web. Shromažďujeme anonymní data o návštěvnosti a chování uživatelů.
              </p>
            </div>

            <div className="border-l-4 border-black pl-4">
              <h3 className="text-lg font-bold mb-2 uppercase">Marketingové cookies</h3>
              <p style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '19.6px', marginTop: '12px', marginBottom: '12px' }}>
                Používají se k zobrazování relevantních reklam a měření efektivity reklamních kampaní.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8" style={{ textAlign: 'center' }}>
          <h2 className="text-2xl font-bold mb-4 uppercase">Jak spravovat cookies?</h2>
          <p style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '19.6px', marginTop: '12px', marginBottom: '12px' }}>
            Svůj souhlas s používáním cookies můžete kdykoli změnit v nastavení cookies. Cookies můžete také zakázat v nastavení vašeho prohlížeče.
          </p>
        </div>

        <div className="border border-black p-6 bg-gray-50" style={{ textAlign: 'center' }}>
          <h3 className="text-lg font-bold mb-3 uppercase">Odmítnutí cookies</h3>
          <p style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '19.6px', marginTop: '12px', marginBottom: '12px' }}>
            Pokud odmítnete cookies, některé funkce webu nemusí fungovat správně. Nezbytné cookies budou použity vždy, protože jsou nutné pro základní fungování webu.
          </p>
        </div>
      </div>
    </div>
  );
}
