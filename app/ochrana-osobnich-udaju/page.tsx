import Accordion from '@/components/Accordion';

export default function PrivacyPolicyPage() {
  const privacyItems = [
    {
      title: 'Správce osobních údajů',
      content: (
        <div>
          <p>Správcem vašich osobních údajů je Vojtěch Vojkovský, Bachelor of Arts, se sídlem v Třebechovicích pod Orebem, IČO: 08701032.</p>
        </div>
      )
    },
    {
      title: 'Jaké údaje shromažďujeme',
      content: (
        <div className="space-y-3">
          <p>Shromažďujeme pouze údaje nezbytné pro vyřízení vaší objednávky a poskytování našich služeb:</p>
          <ul className="list-disc list-inside ml-4 space-y-2 mt-3">
            <li>Jméno a příjmení</li>
            <li>E-mailová adresa</li>
            <li>Doručovací adresa</li>
            <li>Telefonní číslo</li>
            <li>Fakturační údaje</li>
          </ul>
        </div>
      )
    },
    {
      title: 'Účel zpracování údajů',
      content: (
        <div className="space-y-3">
          <p>Vaše osobní údaje používáme výhradně pro:</p>
          <ul className="list-disc list-inside ml-4 space-y-2 mt-3">
            <li>Vyřízení a doručení objednávky</li>
            <li>Komunikaci týkající se vaší objednávky</li>
            <li>Vystavení daňových dokladů</li>
            <li>Zasílání newsletteru (pouze se souhlasem)</li>
            <li>Řešení reklamací a dotazů</li>
          </ul>
        </div>
      )
    },
    {
      title: 'Doba uchovávání údajů',
      content: (
        <div>
          <p>Osobní údaje uchováváme po dobu nezbytnou pro splnění účelu zpracování, nebo po dobu stanovenou právními předpisy. Údaje související s účetními doklady uchováváme po dobu 10 let v souladu s daňovými předpisy.</p>
        </div>
      )
    },
    {
      title: 'Vaše práva',
      content: (
        <div className="space-y-3">
          <p>V souvislosti se zpracováním osobních údajů máte následující práva:</p>
          <ul className="list-disc list-inside ml-4 space-y-2 mt-3">
            <li>Právo na přístup k osobním údajům</li>
            <li>Právo na opravu nepřesných údajů</li>
            <li>Právo na výmaz údajů</li>
            <li>Právo na omezení zpracování</li>
            <li>Právo na přenositelnost údajů</li>
            <li>Právo vznést námitku proti zpracování</li>
            <li>Právo podat stížnost u Úřadu pro ochranu osobních údajů</li>
          </ul>
          <div className="border-2 border-black p-6 bg-white mt-6">
            <h4 className="uppercase mb-3 text-center font-bold text-sm">Kontakt</h4>
            <p>Pro uplatnění vašich práv nebo dotazy týkající se ochrany osobních údajů nás kontaktujte na e-mailu: ufosport@mail.com</p>
          </div>
        </div>
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
      <div className="relative z-10 flex flex-col items-center" style={{ paddingTop: '64px' }}>
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

          <Accordion items={privacyItems} />
        </div>
      </div>
    </div>
  );
}
