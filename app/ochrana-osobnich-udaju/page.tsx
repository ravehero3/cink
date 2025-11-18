export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white relative">
      {/* Left vertical line - starts after header (44px) and extends to footer1 */}
      <div className="absolute left-1/4 w-px bg-black z-0" style={{ top: '44px', bottom: 0 }} />
      
      {/* Right vertical line - starts after header (44px) and extends to footer1 */}
      <div className="absolute right-1/4 w-px bg-black z-0" style={{ top: '44px', bottom: 0 }} />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center" style={{ paddingTop: '44px' }}>
        <div style={{ width: '33.33%' }} className="pb-16">
          <h1 
            className="uppercase text-center mb-8"
            style={{
              fontFamily: '"Roboto Condensed", "Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '20px',
              fontWeight: 700,
              letterSpacing: '0.05em'
            }}
          >
            ZÁSADY OCHRANY OSOBNÍCH ÚDAJŮ
          </h1>
          
          <div>
            <p 
              className="text-center mb-12"
              style={{
                fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: '1.6'
              }}
            >
              Ochrana vašich osobních údajů je pro nás prioritou. Tento dokument popisuje, jak shromažďujeme, používáme a chráníme vaše osobní údaje v souladu s nařízením GDPR a českým zákonem o ochraně osobních údajů.
            </p>

            <div className="mb-12">
              <h2 
                className="uppercase mb-4"
                style={{
                  fontFamily: '"Roboto Condensed", "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '20px',
                  fontWeight: 700,
                  letterSpacing: '0.05em'
                }}
              >
                Správce osobních údajů
              </h2>
              <p 
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '1.6'
                }}
              >
                Správcem vašich osobních údajů je Vojtěch Vojkovský, Bachelor of Arts, se sídlem v Třebechovicích pod Orebem, IČO: 08701032.
              </p>
            </div>

            <div className="mb-12">
              <h2 
                className="uppercase mb-4"
                style={{
                  fontFamily: '"Roboto Condensed", "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '20px',
                  fontWeight: 700,
                  letterSpacing: '0.05em'
                }}
              >
                Jaké údaje shromažďujeme
              </h2>
              <p 
                className="mb-4"
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '1.6'
                }}
              >
                Shromažďujeme pouze údaje nezbytné pro vyřízení vaší objednávky a poskytování našich služeb:
              </p>
              <ul 
                className="space-y-2 list-disc list-inside"
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '1.6'
                }}
              >
                <li>Jméno a příjmení</li>
                <li>E-mailová adresa</li>
                <li>Doručovací adresa</li>
                <li>Telefonní číslo</li>
                <li>Fakturační údaje</li>
              </ul>
            </div>

            <div className="mb-12">
              <h2 
                className="uppercase mb-4"
                style={{
                  fontFamily: '"Roboto Condensed", "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '20px',
                  fontWeight: 700,
                  letterSpacing: '0.05em'
                }}
              >
                Účel zpracování údajů
              </h2>
              <p 
                className="mb-4"
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '1.6'
                }}
              >
                Vaše osobní údaje používáme výhradně pro:
              </p>
              <ul 
                className="space-y-2 list-disc list-inside"
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '1.6'
                }}
              >
                <li>Vyřízení a doručení objednávky</li>
                <li>Komunikaci týkající se vaší objednávky</li>
                <li>Vystavení daňových dokladů</li>
                <li>Zasílání newsletteru (pouze se souhlasem)</li>
                <li>Řešení reklamací a dotazů</li>
              </ul>
            </div>

            <div className="mb-12">
              <h2 
                className="uppercase mb-4"
                style={{
                  fontFamily: '"Roboto Condensed", "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '20px',
                  fontWeight: 700,
                  letterSpacing: '0.05em'
                }}
              >
                Doba uchovávání údajů
              </h2>
              <p 
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '1.6'
                }}
              >
                Osobní údaje uchováváme po dobu nezbytnou pro splnění účelu zpracování, nebo po dobu stanovenou právními předpisy. Údaje související s účetními doklady uchováváme po dobu 10 let v souladu s daňovými předpisy.
              </p>
            </div>

            <div className="mb-12">
              <h2 
                className="uppercase mb-4"
                style={{
                  fontFamily: '"Roboto Condensed", "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '20px',
                  fontWeight: 700,
                  letterSpacing: '0.05em'
                }}
              >
                Vaše práva
              </h2>
              <p 
                className="mb-4"
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '1.6'
                }}
              >
                V souvislosti se zpracováním osobních údajů máte následující práva:
              </p>
              <ul 
                className="space-y-2 list-disc list-inside"
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '1.6'
                }}
              >
                <li>Právo na přístup k osobním údajům</li>
                <li>Právo na opravu nepřesných údajů</li>
                <li>Právo na výmaz údajů</li>
                <li>Právo na omezení zpracování</li>
                <li>Právo na přenositelnost údajů</li>
                <li>Právo vznést námitku proti zpracování</li>
                <li>Právo podat stížnost u Úřadu pro ochranu osobních údajů</li>
              </ul>
            </div>

            <div className="border-2 border-black p-6 bg-white">
              <h3 
                className="uppercase mb-3 text-center"
                style={{
                  fontFamily: '"Roboto Condensed", "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
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
                Pro uplatnění vašich práv nebo dotazy týkající se ochrany osobních údajů nás kontaktujte na e-mailu: ufosport@mail.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
