import Accordion from '@/components/Accordion';

export default function DeliveryPage() {
  const deliveryFAQs = [
    {
      title: 'Možnosti doručení',
      content: (
        <div className="space-y-4">
          <div>
            <p className="font-bold mb-2">Zásilkovna - 79 Kč</p>
            <p>Doručení na vybranou výdejní místo Zásilkovny v celé České republice. Široká síť výdejních míst pro maximální pohodlí.</p>
          </div>
          <div>
            <p className="font-bold mb-2">Česká pošta - 99 Kč</p>
            <p>Doručení poštou přímo na vaši adresu. Spolehlivá a osvědčená možnost doručení.</p>
          </div>
          <div>
            <p className="font-bold mb-2">PPL - 129 Kč</p>
            <p>Expresní doručení kurýrem přímo na vaši adresu. Nejrychlejší možnost dopravy.</p>
          </div>
        </div>
      )
    },
    {
      title: 'Doba dodání',
      content: (
        <div className="space-y-3">
          <p><strong>Zásilkovna:</strong> 1-3 pracovní dny od odeslání objednávky</p>
          <p><strong>Česká pošta:</strong> 2-5 pracovních dnů od odeslání objednávky</p>
          <p><strong>PPL:</strong> 1-2 pracovní dny od odeslání objednávky</p>
          <p className="mt-4">Objednávky odeslané do 14:00 jsou zpracovány a odeslány tentýž pracovní den. Objednávky po 14:00 budou zpracovány následující pracovní den.</p>
        </div>
      )
    },
    {
      title: 'Sledování zásilky',
      content: (
        <div className="space-y-3">
          <p>Po odeslání objednávky obdržíte e-mail s potvrzením a sledovacím číslem zásilky.</p>
          <p>Pomocí sledovacího čísla můžete kontrolovat aktuální stav vaší zásilky:</p>
          <ul className="list-disc list-inside ml-4 space-y-2 mt-3">
            <li>Zásilkovna: Sledování přes aplikaci nebo web Zásilkovny</li>
            <li>Česká pošta: Sledování na trackandtrace.post.cz</li>
            <li>PPL: Sledování na webu PPL</li>
          </ul>
          <p className="mt-4">Také můžete sledovat stav objednávky přímo na našem webu v sekci "Sledování objednávky".</p>
        </div>
      )
    },
    {
      title: 'Podmínky doručení',
      content: (
        <div className="space-y-3">
          <p>Pro úspěšné doručení zásilky je nutné dodržet následující podmínky:</p>
          <ul className="list-disc list-inside ml-4 space-y-2 mt-3">
            <li>Uvádějte přesnou a kompletní doručovací adresu</li>
            <li>Při doručení na adresu je vyžadován podpis oprávněné osoby</li>
            <li>Zásilku je nutné převzít do 7 dnů od doručení na výdejní místo</li>
            <li>Při převzetí zkontrolujte neporušenost obalu</li>
            <li>V případě viditelného poškození zásilku nepřebírejte a kontaktujte nás</li>
          </ul>
        </div>
      )
    },
    {
      title: 'Co dělat při poškozené zásilce',
      content: (
        <div className="space-y-3">
          <p>Pokud obdržíte poškozenou zásilku, postupujte následovně:</p>
          <ol className="list-decimal list-inside ml-4 space-y-2 mt-3">
            <li>Nepřebírejte viditelně poškozenou zásilku od dopravce</li>
            <li>Pokud již byla zásilka převzata, vyfotografujte poškození obalu i obsahu</li>
            <li>Okamžitě nás kontaktujte na e-mailu ufosport@mail.com</li>
            <li>Uveďte číslo objednávky a přiložte fotografie poškození</li>
            <li>Zásilku nelikvidujte, budeme potřebovat posoudit škodu</li>
          </ol>
          <p className="mt-4">Vyřešíme situaci co nejrychleji - buď zašleme náhradní zboží, nebo vrátíme peníze.</p>
        </div>
      )
    },
    {
      title: 'Mezinárodní doručení',
      content: (
        <div className="space-y-3">
          <p>V současné době nabízíme doručení pouze v rámci České republiky.</p>
          <p>Mezinárodní doprava není momentálně dostupná. Pracujeme na rozšíření možností doručení do dalších zemí.</p>
          <p className="mt-4">Pokud máte zájem o mezinárodní doručení, kontaktujte nás prosím na e-mailu ufosport@mail.com a my vás budeme informovat, jakmile tuto službu zpřístupníme.</p>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-white relative">
      {/* Left vertical line - starts after header (44px) and extends to footer */}
      <div className="absolute left-1/4 w-px bg-black z-0" style={{ top: '44px', bottom: 0 }} />
      
      {/* Right vertical line - starts after header (44px) and extends to footer */}
      <div className="absolute right-1/4 w-px bg-black z-0" style={{ top: '44px', bottom: 0 }} />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center pt-12">
        <h1 
          className="uppercase text-center mb-12"
          style={{
            fontFamily: '"Roboto Condensed", "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '20px',
            fontWeight: 700,
            letterSpacing: '0.05em'
          }}
        >
          DORUČENÍ - ČASTO KLADENÉ OTÁZKY
        </h1>

        <div style={{ width: '33.33%' }}>
          <Accordion items={deliveryFAQs} />
        </div>
      </div>
    </div>
  );
}
