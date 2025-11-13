export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 uppercase tracking-wider text-center">ZÁSADY OCHRANY OSOBNÍCH ÚDAJŮ</h1>
      
      <div className="max-w-3xl mx-auto">
        <p style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '19.6px', marginTop: '12px', marginBottom: '12px', textAlign: 'center' }}>
          Ochrana vašich osobních údajů je pro nás prioritou. Tento dokument popisuje, jak shromažďujeme, používáme a chráníme vaše osobní údaje v souladu s nařízením GDPR a českým zákonem o ochraně osobních údajů.
        </p>

        <div className="mb-8" style={{ textAlign: 'center' }}>
          <h2 className="text-2xl font-bold mb-4 uppercase">Správce osobních údajů</h2>
          <p style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '19.6px', marginTop: '12px', marginBottom: '12px' }}>
            Správcem vašich osobních údajů je Vojtěch Vojkovský, Bachelor of Arts, se sídlem v Třebechovicích pod Orebem, IČO: 08701032.
          </p>
        </div>

        <div className="mb-8" style={{ textAlign: 'center' }}>
          <h2 className="text-2xl font-bold mb-4 uppercase">Jaké údaje shromažďujeme</h2>
          <p style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '19.6px', marginTop: '12px', marginBottom: '12px' }}>
            Shromažďujeme pouze údaje nezbytné pro vyřízení vaší objednávky a poskytování našich služeb:
          </p>
          <ul className="space-y-2" style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '19.6px', listStyle: 'none', padding: 0 }}>
            <li>Jméno a příjmení</li>
            <li>E-mailová adresa</li>
            <li>Doručovací adresa</li>
            <li>Telefonní číslo</li>
            <li>Fakturační údaje</li>
          </ul>
        </div>

        <div className="mb-8" style={{ textAlign: 'center' }}>
          <h2 className="text-2xl font-bold mb-4 uppercase">Účel zpracování údajů</h2>
          <p style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '19.6px', marginTop: '12px', marginBottom: '12px' }}>
            Vaše osobní údaje používáme výhradně pro:
          </p>
          <ul className="space-y-2" style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '19.6px', listStyle: 'none', padding: 0 }}>
            <li>Vyřízení a doručení objednávky</li>
            <li>Komunikaci týkající se vaší objednávky</li>
            <li>Vystavení daňových dokladů</li>
            <li>Zasílání newsletteru (pouze se souhlasem)</li>
            <li>Řešení reklamací a dotazů</li>
          </ul>
        </div>

        <div className="mb-8" style={{ textAlign: 'center' }}>
          <h2 className="text-2xl font-bold mb-4 uppercase">Doba uchovávání údajů</h2>
          <p style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '19.6px', marginTop: '12px', marginBottom: '12px' }}>
            Osobní údaje uchováváme po dobu nezbytnou pro splnění účelu zpracování, nebo po dobu stanovenou právními předpisy. Údaje související s účetními doklady uchováváme po dobu 10 let v souladu s daňovými předpisy.
          </p>
        </div>

        <div className="mb-8" style={{ textAlign: 'center' }}>
          <h2 className="text-2xl font-bold mb-4 uppercase">Vaše práva</h2>
          <p style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '19.6px', marginTop: '12px', marginBottom: '12px' }}>
            V souvislosti se zpracováním osobních údajů máte následující práva:
          </p>
          <ul className="space-y-2" style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '19.6px', listStyle: 'none', padding: 0 }}>
            <li>Právo na přístup k osobním údajům</li>
            <li>Právo na opravu nepřesných údajů</li>
            <li>Právo na výmaz údajů</li>
            <li>Právo na omezení zpracování</li>
            <li>Právo na přenositelnost údajů</li>
            <li>Právo vznést námitku proti zpracování</li>
            <li>Právo podat stížnost u Úřadu pro ochranu osobních údajů</li>
          </ul>
        </div>

        <div className="border border-black p-6 bg-gray-50" style={{ textAlign: 'center' }}>
          <h3 className="text-lg font-bold mb-3 uppercase">Kontakt</h3>
          <p style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '19.6px', marginTop: '12px', marginBottom: '12px' }}>
            Pro uplatnění vašich práv nebo dotazy týkající se ochrany osobních údajů nás kontaktujte na e-mailu: ufosport@mail.com
          </p>
        </div>
      </div>
    </div>
  );
}
