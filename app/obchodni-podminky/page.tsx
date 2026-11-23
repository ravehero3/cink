'use client';

import Link from 'next/link';

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-white relative">
      {/* Left vertical line */}
      <div className="hidden md:block absolute left-1/4 w-px bg-black z-0" style={{ top: 0, bottom: 0 }} />
      
      {/* Right vertical line */}
      <div className="hidden md:block absolute right-1/4 w-px bg-black z-0" style={{ top: 0, bottom: 0 }} />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center" style={{ paddingTop: '64px', paddingBottom: '96px' }}>
        <h1 
          className="uppercase text-center mb-2" 
          style={{ 
            fontFamily: '"Roboto Condensed", "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '22px',
            fontWeight: 700,
            letterSpacing: '0.05em'
          }}
        >
          VŠEOBECNÉ OBCHODNÍ PODMÍNKY
        </h1>

        <p 
          className="text-center mb-10 text-xs text-gray-500 uppercase tracking-wider"
          style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif' }}
        >
          platné a účinné od 1. 1. 2026 pro e-shop ufosport.cz
        </p>

        <div 
          className="w-full px-4 md:w-1/2 lg:w-5/12 space-y-8" 
          style={{ 
            fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '13px',
            lineHeight: '1.7',
            color: '#000000'
          }}
        >
          {/* Článek 1 */}
          <section className="border-b border-black pb-6">
            <h2 className="text-sm uppercase font-bold tracking-wider mb-3">1. Úvodní ustanovení a identifikace prodávajícího</h2>
            <p className="mb-2">
              Tyto všeobecné obchodní podmínky (dále jen <strong>„obchodní podmínky“</strong>) upravují vzájemná práva a povinnosti smluvních stran vzniklé v souvislosti nebo na základě kupní smlouvy (dále jen <strong>„kupní smlouva“</strong>) uzavírané mezi prodávajícím a jinou fyzickou či právnickou osobou (dále jen <strong>„kupující“</strong>) prostřednictvím internetového obchodu prodávajícího na adrese <strong>ufosport.cz</strong>.
            </p>
            <div className="bg-[#f7f7f7] border border-black p-4 my-3 text-xs leading-relaxed">
              <p><strong>Prodávající a provozovatel internetového obchodu:</strong></p>
              <p>Jméno a příjmení: <strong>Vojtěch Vojkovský, Bachelor of Arts</strong></p>
              <p>Sídlo: <strong>Bědovická 193E, 503 46 Třebechovice pod Orebem, Česká republika</strong></p>
              <p>IČO: <strong>08701032</strong></p>
              <p>DIČ: <strong>Neplátce DPH</strong> (fyzická osoba zapsaná v živnostenském rejstříku)</p>
              <p>Kontaktní e-mail: <strong>miluju@ufosport.cz</strong></p>
              <p>Webová stránka: <strong>https://ufosport.cz</strong></p>
            </div>
            <p className="text-xs text-gray-600">
              Ustanovení obchodních podmínek jsou nedílnou součástí kupní smlouvy. Kupní smlouva a obchodní podmínky jsou vyhotoveny v českém jazyce. Právní vztahy se řídí právním řádem České republiky, zejména zákonem č. 89/2012 Sb., občanský zákoník, ve znění pozdějších předpisů (dále jen „občanský zákoník“) a zákonem č. 634/1992 Sb., o ochraně spotřebitele.
            </p>
          </section>

          {/* Článek 2 */}
          <section className="border-b border-black pb-6">
            <h2 className="text-sm uppercase font-bold tracking-wider mb-3">2. Informace o zboží a ceny</h2>
            <p className="mb-2">
              Informace o zboží, včetně uvedení cen jednotlivého zboží a jeho hlavních vlastností, jsou uvedeny u jednotlivého zboží v katalogu internetového obchodu. Ceny zboží jsou uvedeny v českých korunách (Kč) včetně všech zákonných poplatků.
            </p>
            <p>
              Ceny zboží zůstávají v platnosti po dobu, po kterou jsou zobrazovány v internetovém obchodě. Tímto ustanovením není omezena možnost prodávajícího uzavřít kupní smlouvu za individuálně sjednaných podmínek. Prezentace zboží umístěná v internetovém obchodě je informativního charakteru a prodávající není povinen uzavřít kupní smlouvu ohledně tohoto zboží.
            </p>
          </section>

          {/* Článek 3 */}
          <section className="border-b border-black pb-6">
            <h2 className="text-sm uppercase font-bold tracking-wider mb-3">3. Objednávka a uzavření kupní smlouvy</h2>
            <p className="mb-2">
              Kupující provádí objednávku zboží prostřednictvím webového rozhraní internetového obchodu vyplněním objednávkového formuláře (výběr zboží, velikosti, způsobu dopravy, platby a kontaktních údajů).
            </p>
            <p className="mb-2">
              Před odesláním objednávky je kupujícímu umožněno zkontrolovat a měnit údaje, které do objednávky vložil. Kupující odešle objednávku prodávajícímu kliknutím na tlačítko <strong>„PŘEJÍT K PLATBĚ“</strong> nebo odesláním formuláře. Údaje uvedené v objednávce jsou prodávajícím považovány za správné. Podmínkou platnosti objednávky je vyplnění všech povinných údajů v objednávkovém formuláři a <strong>aktivní potvrzení souhlasu s těmito obchodními podmínkami</strong>.
            </p>
            <p>
              Kupní smlouva je uzavřena okamžikem, kdy kupujícímu dorazí potvrzení objednávky zaslané prodávajícím elektronickou poštou na adresu uvedenou kupujícím.
            </p>
          </section>

          {/* Článek 4 */}
          <section className="border-b border-black pb-6">
            <h2 className="text-sm uppercase font-bold tracking-wider mb-3">4. Platební a dodací podmínky</h2>
            <p className="mb-2">
              Cenu zboží a případné náklady spojené s dodáním zboží dle kupní smlouvy může kupující uhradit bezhotovostně prostřednictvím online platební brány <strong>GoPay</strong> (platební kartou, rychlým bankovním převodem a dalšími metodami poskytovanými bránou).
            </p>
            <p className="mb-2">
              Zboží je dodáváno prostřednictvím přepravních služeb <strong>Zásilkovna</strong> a <strong>PPL ParcelShop</strong> na zvolené výdejní místo v České republice.
            </p>
            <p>
              Při objednávce zboží v celkové hodnotě <strong>nad 2 000 Kč je doprava zdarma</strong>. U objednávek pod tuto částku je výše dopravného účtována dle zvoleného dopravce v košíku před odesláním objednávky.
            </p>
          </section>

          {/* Článek 5 - ODSTOUPENÍ OD SMLOUVY DLE ZÁKONA */}
          <section className="border-b border-black pb-6 bg-[#fafafa] p-5 border">
            <h2 className="text-sm uppercase font-bold tracking-wider mb-3">5. Odstoupení od kupní smlouvy (Vrácení zboží do 14 dnů)</h2>
            <p className="mb-3">
              Kupující, který je spotřebitelem (dále jen „spotřebitel“), má v souladu s ustanovením § 1829 odst. 1 občanského zákoníku právo <strong>odstoupit od kupní smlouvy bez udání důvodu ve lhůtě 14 dnů</strong> ode dne převzetí zboží.
            </p>
            <ul className="space-y-3 list-disc list-inside">
              <li>
                <strong>Přímé náklady na vrácení zboží nese kupující:</strong> Dle ustanovení § 1820 odst. 1 písm. g) občanského zákoníku prodávající tímto výslovně poučuje spotřebitele, že <strong>v případě odstoupení od kupní smlouvy nese spotřebitel veškeré přímé náklady spojené s navrácením zboží prodávajícímu</strong>.
              </li>
              <li>
                <strong>Zákaz zasílání na dobírku:</strong> Zboží zaslané na dobírku prodávající v žádném případě nepřebírá a taková zásilka bude vrácena zpět odesílateli na jeho náklady.
              </li>
              <li>
                <strong>Lhůta a podmínka pro vrácení peněz:</strong> Odstoupí-li spotřebitel od smlouvy, prodávající mu vrátí bez zbytečného odkladu, nejpozději do 14 dnů ode dne, kdy mu došlo oznámení o odstoupení od smlouvy, všechny peněžní prostředky včetně nákladů na dodání zboží. <strong>V souladu s § 1832 odst. 4 občanského zákoníku však prodávající není povinen vrátit přijaté peněžní prostředky dříve, než mu spotřebitel zboží předá nebo prokáže, že zboží odeslal zpět prodávajícímu.</strong>
              </li>
              <li>
                <strong>Původní náklady na dodání zboží:</strong> Jestliže spotřebitel zvolil jiný než nejlevnější způsob dodání zboží, který prodávající nabízí, vrátí prodávající spotřebiteli náklady na dodání zboží pouze ve výši odpovídající nejlevnějšímu nabízenému způsobu dodání zboží (§ 1832 odst. 2 občanského zákoníku).
              </li>
              <li>
                <strong>Odpovědnost za snížení hodnoty zboží:</strong> V souladu s § 1833 občanského zákoníku spotřebitel odpovídá prodávajícímu za snížení hodnoty zboží, které vzniklo v důsledku nakládání s tímto zbožím jinak, než je nutné k tomu, aby se seznámil s povahou, vlastnostmi a funkčností zboží. Zboží musí být vráceno čisté, neprané, nenošené, nepoškozené a se všemi původními visačkami.
              </li>
            </ul>
            <p className="mt-4 text-xs">
              Pro odstoupení od smlouvy může spotřebitel využít online formulář na stránce <Link href="/vraceni-zbozi" className="underline font-bold">Vrácení zboží</Link> nebo vyplnit a odeslat vzorový formulář uvedený na konci těchto podmínek.
            </p>
          </section>

          {/* Článek 6 */}
          <section className="border-b border-black pb-6">
            <h2 className="text-sm uppercase font-bold tracking-wider mb-3">6. Práva z vadného plnění (Reklamační řád)</h2>
            <p className="mb-2">
              Práva a povinnosti smluvních stran ohledně práv z vadného plnění se řídí příslušnými obecně závaznými právními předpisy (zejména ustanoveními § 1914 až 1925, § 2099 až 2117 a § 2161 až 2174b občanského zákoníku a zákonem o ochraně spotřebitele).
            </p>
            <p className="mb-2">
              Prodávající odpovídá kupujícímu, že zboží při převzetí nemá vady. Spotřebitel je oprávněn uplatnit právo z vady, která se vyskytne u spotřebního zboží v době <strong>24 měsíců od převzetí</strong>.
            </p>
            <p>
              Podrobné informace o uplatnění reklamace a postupu jejího vyřízení naleznete na stránce <Link href="/reklamacni-rad" className="underline font-bold">Reklamační řád</Link>.
            </p>
          </section>

          {/* Článek 7 */}
          <section className="border-b border-black pb-6">
            <h2 className="text-sm uppercase font-bold tracking-wider mb-3">7. Mimosoudní řešení spotřebitelských sporů</h2>
            <p className="mb-2">
              K mimosoudnímu řešení spotřebitelských sporů z kupní smlouvy je příslušná <strong>Česká obchodní inspekce</strong>, se sídlem Štěpánská 567/15, 120 00 Praha 2, IČ: 000 20 869, internetová adresa: <a href="https://www.coi.cz" target="_blank" rel="noopener noreferrer" className="underline font-bold">https://www.coi.cz</a>.
            </p>
            <p>
              Spotřebitel může využít rovněž platformu pro řešení sporů on-line zřízenou Evropskou komisí na internetové adrese <a href="http://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="underline">http://ec.europa.eu/consumers/odr</a>.
            </p>
          </section>

          {/* Článek 8 */}
          <section className="border-b border-black pb-6">
            <h2 className="text-sm uppercase font-bold tracking-wider mb-3">8. Závěrečná ustanovení</h2>
            <p className="mb-2">
              Všechna ujednání mezi prodávajícím a kupujícím se řídí právním řádem České republiky. Pokud vztah založený kupní smlouvou obsahuje mezinárodní prvek, sjednávají strany, že vztah se řídí právem České republiky, s vyloučením Úmluvy OSN o smlouvách o mezinárodní koupi zboží. Tímto nejsou dotčena práva spotřebitele vyplývající z obecně závazných právních předpisů.
            </p>
            <p>
              Zásady zpracování osobních údajů jsou upraveny v samostatném dokumentu dostupném na stránce <Link href="/ochrana-osobnich-udaju" className="underline font-bold">Ochrana osobních údajů</Link>.
            </p>
          </section>

          {/* VZOROVÝ FORMULÁŘ */}
          <section className="border border-black p-6 bg-[#f7f7f7]">
            <h2 className="text-sm uppercase font-bold tracking-wider mb-3">Vzorový formulář pro odstoupení od kupní smlouvy</h2>
            <p className="text-xs text-gray-600 mb-4">
              (vyplňte tento formulář a pošlete jej zpět prodávajícímu pouze v případě, že chcete odstoupit od smlouvy)
            </p>
            <div className="bg-white border border-black p-4 text-xs font-mono space-y-2 leading-relaxed">
              <p><strong>Adresát:</strong></p>
              <p>UFO SPORT – Vojtěch Vojkovský, Bachelor of Arts</p>
              <p>Bědovická 193E, 503 46 Třebechovice pod Orebem, Česká republika</p>
              <p>E-mail: miluju@ufosport.cz</p>
              <hr className="my-2 border-gray-300" />
              <p><strong>Oznámení o odstoupení od kupní smlouvy:</strong></p>
              <p>Oznamuji/oznamujeme (*), že tímto odstupuji/odstupujeme (*) od smlouvy o nákupu tohoto zboží (*):</p>
              <p>.......................................................................................</p>
              <p>Číslo objednávky: ..................................................................</p>
              <p>Datum objednání (*) / datum obdržení (*): ............................................</p>
              <p>Jméno a příjmení spotřebitele/spotřebitelů: ..........................................</p>
              <p>Adresa spotřebitele/spotřebitelů: ....................................................</p>
              <p>Číslo bankovního účtu pro vrácení platby: ...........................................</p>
              <p>Podpis spotřebitele/spotřebitelů (pouze pokud je formulář zasílán v listinné podobě):</p>
              <p>.......................................................................................</p>
              <p>Datum: ..............................................................................</p>
              <p className="text-[10px] text-gray-500 mt-2">(*) Nehodící se škrtněte nebo údaje doplňte.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

