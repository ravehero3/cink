import Accordion from '@/components/Accordion';

export default function LegalPage() {
  const legalItems = [
    {
      title: '1. Provozovatel e-shopu',
      content: (
        <div className="space-y-3">
          <p><strong>Název:</strong> Vojtěch Vojkovský, Bachelor of Arts</p>
          <p><strong>Sídlo:</strong> Třebechovice pod Orebem</p>
          <p><strong>IČO:</strong> 08701032</p>
        </div>
      )
    },
    {
      title: '2. Obchodní podmínky',
      content: (
        <div>
          <p>Platné obchodní podmínky upravují vztahy mezi provozovatelem e-shopu a zákazníky. Objednáním zboží zákazník potvrzuje, že se seznámil s obchodními podmínkami a že s nimi souhlasí.</p>
        </div>
      )
    },
    {
      title: '3. Reklamace',
      content: (
        <div>
          <p>Reklamaci můžete uplatnit e-mailem. Více informací naleznete v reklamačním řádu.</p>
        </div>
      )
    },
    {
      title: '4. Ochrana osobních údajů',
      content: (
        <div>
          <p>Zpracování osobních údajů se řídí nařízením GDPR a zákonem o ochraně osobních údajů. Vaše osobní údaje používáme pouze k vyřízení objednávky a nebudou poskytnuty třetím stranám.</p>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-white relative">
      {/* Left vertical line - starts at top (header padding handled by body) */}
      <div className="hidden md:block absolute left-1/4 w-px bg-black z-0" style={{ top: 0, bottom: 0 }} />
      
      {/* Right vertical line - starts at top (header padding handled by body) */}
      <div className="hidden md:block absolute right-1/4 w-px bg-black z-0" style={{ top: 0, bottom: 0 }} />

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
          PRÁVNÍ INFORMACE
        </h1>
        
        <div className="w-full px-4 md:w-1/3 md:px-0">
          <Accordion items={legalItems} />
        </div>
      </div>
    </div>
  );
}
