export default function LegalPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 uppercase tracking-wider">PRÁVNÍ INFORMACE</h1>
      
      <div className="max-w-3xl">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 uppercase">Provozovatel e-shopu</h2>
          <div className="text-base leading-relaxed space-y-2">
            <p><strong>Název:</strong> UFO SPORT</p>
            <p><strong>Adresa:</strong> Běloves 378, 547 01 Náchod</p>
            <p><strong>IČO:</strong> [IČO]</p>
            <p><strong>DIČ:</strong> [DIČ]</p>
            <p><strong>Telefon:</strong> +420 775 181 107</p>
            <p><strong>E-mail:</strong> ufosport@mail.com</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 uppercase">Obchodní podmínky</h2>
          <p className="text-base leading-relaxed mb-4">
            Platné obchodní podmínky upravují vztahy mezi provozovatelem e-shopu a zákazníky. Objednáním zboží zákazník potvrzuje, že se seznámil s obchodními podmínkami a že s nimi souhlasí.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 uppercase">Reklamace</h2>
          <p className="text-base leading-relaxed mb-4">
            Reklamaci můžete uplatnit osobně na našich prodejnách, písemně na naší adrese nebo e-mailem. Více informací naleznete v reklamačním řádu.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 uppercase">Ochrana osobních údajů</h2>
          <p className="text-base leading-relaxed mb-4">
            Zpracování osobních údajů se řídí nařízením GDPR a zákonem o ochrane osobních údajů. Vaše osobní údaje používáme pouze k vyřízení objednávky a nebudou poskytnuty třetím stranám.
          </p>
        </div>

        <div className="border border-black p-6 bg-gray-50">
          <h3 className="text-lg font-bold mb-3 uppercase">Mimosoudní řešení sporů</h3>
          <p className="text-base leading-relaxed">
            V případě sporu můžete využít služeb České obchodní inspekce nebo jiných subjektů mimosoudního řešení spotřebitelských sporů.
          </p>
        </div>
      </div>
    </div>
  );
}
