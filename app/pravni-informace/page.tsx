import Accordion from '@/components/Accordion';
import Link from 'next/link';

export default function LegalPage() {
  const legalItems = [
    {
      title: '1. Provozovatel e-shopu',
      content: (
        <div className="space-y-2 text-sm leading-relaxed">
          <p><strong>Název:</strong> Vojtěch Vojkovský, Bachelor of Arts</p>
          <p><strong>Sídlo:</strong> Bědovická 193E, 503 46 Třebechovice pod Orebem, Česká republika</p>
          <p><strong>IČO:</strong> 08701032</p>
          <p><strong>DIČ:</strong> Fyzická osoba zapsaná v živnostenském rejstříku (Neplátce DPH)</p>
          <p><strong>E-mail:</strong> miluju@ufosport.cz</p>
        </div>
      )
    },
    {
      title: '2. Všeobecné obchodní podmínky (VOP)',
      content: (
        <div className="space-y-3 text-sm leading-relaxed">
          <p>
            Všeobecné obchodní podmínky upravují práva a povinnosti smluvních stran vzniklé v souvislosti nebo na základě kupní smlouvy uzavírané mezi prodávajícím a kupujícím prostřednictvím internetového obchodu UFO SPORT na adrese ufosport.cz.
          </p>
          <p>
            Plné znění podmínek včetně informací o uzavření kupní smlouvy, platebních metodách a mimosoudním řešení spotřebitelských sporů (ČOI) naleznete na samostatné stránce:
          </p>
          <div>
            <Link 
              href="/obchodni-podminky" 
              className="inline-block border border-black px-4 py-2 text-xs font-bold uppercase tracking-wider bg-black text-white hover:bg-white hover:text-black transition-colors"
            >
              Přejít na Obchodní podmínky →
            </Link>
          </div>
        </div>
      )
    },
    {
      title: '3. Odstoupení od smlouvy (Vrácení zboží do 14 dnů)',
      content: (
        <div className="space-y-3 text-sm leading-relaxed">
          <p>
            Podle § 1829 odst. 1 zákona č. 89/2012 Sb. (občanský zákoník) má spotřebitel právo odstoupit od kupní smlouvy bez udání důvodu do <strong>14 dnů od převzetí zboží</strong>.
          </p>
          <p>
            <strong>Upozornění:</strong> Podle § 1820 odst. 1 písm. g) občanského zákoníku <strong>nese přímé náklady spojené s vrácením zboží v plné výši kupující</strong>. Zásilky zaslané na dobírku nebudou převzaty.
          </p>
          <div>
            <Link 
              href="/vraceni-zbozi" 
              className="inline-block border border-black px-4 py-2 text-xs font-bold uppercase tracking-wider bg-black text-white hover:bg-white hover:text-black transition-colors"
            >
              Registrace vrácení zboží a instrukce →
            </Link>
          </div>
        </div>
      )
    },
    {
      title: '4. Reklamace a práva z vadného plnění',
      content: (
        <div className="space-y-3 text-sm leading-relaxed">
          <p>
            Kupující má právo uplatnit právo z vady, která se vyskytne u spotřebního zboží v době <strong>24 měsíců</strong> od převzetí podle příslušných ustanovení občanského zákoníku.
          </p>
          <p>
            Podrobné postupy pro uplatnění reklamace, lhůty a vaše zákonná práva naleznete v našem reklamačním řádu:
          </p>
          <div>
            <Link 
              href="/reklamacni-rad" 
              className="inline-block border border-black px-4 py-2 text-xs font-bold uppercase tracking-wider bg-black text-white hover:bg-white hover:text-black transition-colors"
            >
              Přejít na Reklamační řád →
            </Link>
          </div>
        </div>
      )
    },
    {
      title: '5. Ochrana osobních údajů (GDPR)',
      content: (
        <div className="space-y-3 text-sm leading-relaxed">
          <p>
            Zpracování osobních údajů probíhá v souladu s Nařízením Evropského parlamentu a Rady (EU) 2016/679 (GDPR) a zákonem č. 110/2019 Sb., o zpracování osobních údajů. Vaše osobní údaje zpracováváme výhradně pro účely řádného vyřízení objednávky a plnění zákonných povinností.
          </p>
          <div>
            <Link 
              href="/ochrana-osobnich-udaju" 
              className="inline-block border border-black px-4 py-2 text-xs font-bold uppercase tracking-wider bg-black text-white hover:bg-white hover:text-black transition-colors"
            >
              Zásady ochrany osobních údajů →
            </Link>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-white relative">
      {/* Left vertical line - starts at top */}
      <div className="hidden md:block absolute left-1/4 w-px bg-black z-0" style={{ top: 0, bottom: 0 }} />
      
      {/* Right vertical line - starts at top */}
      <div className="hidden md:block absolute right-1/4 w-px bg-black z-0" style={{ top: 0, bottom: 0 }} />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center" style={{ paddingTop: '64px', paddingBottom: '80px' }}>
        <h1 
          className="uppercase text-center mb-4" 
          style={{ 
            fontFamily: '"Roboto Condensed", "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '20px',
            fontWeight: 700,
            letterSpacing: '0.05em'
          }}
        >
          PRÁVNÍ INFORMACE
        </h1>

        <p 
          className="text-center mb-10 w-full px-4 md:w-1/3 md:px-0 text-sm text-gray-600"
          style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif' }}
        >
          Přehled právních dokumentů a informací provozovatele e-shopu ufosport.cz v souladu s právním řádem České republiky.
        </p>
        
        <div className="w-full px-4 md:w-1/3 md:px-0">
          <Accordion items={legalItems} />
        </div>
      </div>
    </div>
  );
}
