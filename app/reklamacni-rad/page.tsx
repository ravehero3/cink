import PageFrame from '@/components/PageFrame';

export default function ReklamacniRadPage() {
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
          className="uppercase text-center mb-12" 
          style={{ 
            fontFamily: '"Roboto Condensed", "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '32px',
            fontWeight: 700,
            letterSpacing: '0.05em'
          }}
        >
          REKLAMAČNÍ ŘÁD
        </h1>

        <div 
          className="space-y-6"
          style={{
            fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '14px',
            lineHeight: '1.6',
            color: '#000000'
          }}
        >
          <section>
            <h2 className="font-bold text-lg mb-4">Poučení o právu na odstoupení od smlouvy</h2>
            
            <h3 className="font-bold text-base mb-3">1. Právo odstoupit od smlouvy</h3>
            
            <p className="mb-3">
              <strong>1.1</strong> Do 14 dnů máte právo jako spotřebitel odstoupit od této smlouvy bez udání důvodu.
            </p>
            
            <p className="mb-3">
              <strong>1.2</strong> Máte právo odstoupit od smlouvy bez udání důvodu ve lhůtě 14 dnů ode dne následujícího po dni uzavření smlouvy a v případě uzavření kupní smlouvy, kdy Vy nebo Vámi určená třetí osoba (jiná než dopravce) převezmete zboží. U zboží dodané po částech se počítá převzetí poslední dodávky, u pravidelné opakované dodávky se počítá převzetí první dodávky zboží.
            </p>
            
            <p className="mb-3">
              <strong>1.3</strong> Pro účely uplatnění práva na odstoupení od smlouvy musíte o svém odstoupení od této smlouvy informovat společnost <strong>UFO SPORT, se sídlem Bědovická 193, Třebechovice pod Orebem, 503 46</strong>, identifikační číslo <strong>08701032</strong>, formou jednostranného právního jednání (například dopisem zaslaným prostřednictvím provozovatele poštovních služeb, nebo faxem). Můžete použít přiložený vzorový formulář pro odstoupení od smlouvy, není to však Vaší povinností.
            </p>
            
            <p className="mb-6">
              <strong>1.4</strong> Aby byla dodržena lhůta pro odstoupení od této smlouvy, postačuje odeslat odstoupení od smlouvy před uplynutím příslušné lhůty.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-base mb-3">2. Důsledky odstoupení od smlouvy</h3>
            
            <p className="mb-3">
              <strong>2.1</strong> Pokud odstoupíte od této smlouvy, vrátíme Vám bez zbytečného odkladu, nejpozději do 14 dnů ode dne, kdy nám došlo Vaše oznámení o odstoupení od smlouvy, všechny platby, které jsme od Vás obdrželi, včetně nákladů na dodání (kromě dodatečných nákladů vzniklých v důsledku Vámi zvoleného způsobu dodání, který je jiný než nejlevnější způsob standardního dodání námi nabízený). Pro vrácení plateb použijeme stejný platební prostředek, který jste použil(a) pro provedení počáteční transakce, pokud jste výslovně neurčil(a) jinak. V žádném případě Vám tím nevzniknou další náklady. Platbu vrátíme až po obdržení vráceného zboží nebo prokážete-li, že jste zboží odeslal(a) zpět, podle toho, co nastane dříve.
            </p>
            
            <p className="mb-3">
              <strong>2.2</strong> Ponesete přímé náklady spojené s vrácením zboží. Odpovídáte pouze za snížení hodnoty zboží v důsledku nakládání s tímto zbožím jiným způsobem, než který je nutný k obeznámení se s povahou a vlastnostmi zboží, včetně jeho funkčnosti. Nárok na náhradu škody za snížení hodnoty zboží jsme oprávněni jednostranně započíst proti Vašemu nároku na vrácení kupní ceny.
            </p>
            
            <p className="mb-6">
              <strong>2.3</strong> Pokud jste požádal(a), aby poskytování služeb začalo během lhůty pro odstoupení od smlouvy, zaplatíte nám částku úměrnou rozsahu poskytnutých služeb do doby, kdy jste nás informoval(a) o odstoupení od smlouvy, a to v porovnání s celkovým rozsahem služeb stanoveným ve smlouvě.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-base mb-3">Vzorový formulář pro odstoupení od smlouvy</h3>
            
            <p className="mb-4 italic">(vyplňte tento formulář a pošlete jej zpět pouze v případě, že chcete odstoupit od smlouvy):</p>
            
            <div className="border border-black p-6 space-y-4">
              <h4 className="font-bold">Oznámení o odstoupení od smlouvy</h4>
              
              <p>
                Adresát (zde podnikatel vloží jméno a příjmení/obchodní firmu, adresu sídla a případně faxové číslo a e-mailovou adresu podnikatele)
              </p>
              
              <p>
                Oznamuji/oznamujeme (*), že tímto odstupuji/odstupujeme (*) od smlouvy o nákupu tohoto zboží (*)/o poskytnutí těchto služeb (*)
              </p>
              
              <p>Datum objednání (*)/datum obdržení (*)</p>
              
              <p>Jméno a příjmení spotřebitele/spotřebitelů</p>
              
              <p>Adresa spotřebitele/spotřebitelů</p>
              
              <p>Podpis spotřebitele/spotřebitelů (pouze pokud je tento formulář zasílán v listinné podobě)</p>
              
              <p>Datum</p>
              
              <p className="mt-4 italic text-sm">(*) Nehodící se škrtněte nebo údaje doplňte.</p>
            </div>
          </section>
        </div>
      </div>
    </PageFrame>
  );
}
