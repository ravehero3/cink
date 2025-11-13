export default function LegalPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 uppercase tracking-wider text-center">PRÁVNÍ INFORMACE</h1>
      
      <div className="max-w-3xl mx-auto">
        <div className="mb-8" style={{ textAlign: 'center' }}>
          <h2 className="text-2xl font-bold mb-4 uppercase">Provozovatel e-shopu</h2>
          <div className="space-y-2" style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '19.6px' }}>
            <p><strong>Název:</strong> Vojtěch Vojkovský, Bachelor of Arts</p>
            <p><strong>Sídlo:</strong> Třebechovice pod Orebem</p>
            <p><strong>IČO:</strong> 08701032</p>
          </div>
        </div>

        <div className="mb-8" style={{ textAlign: 'center' }}>
          <h2 className="text-2xl font-bold mb-4 uppercase">Obchodní podmínky</h2>
          <p style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '19.6px', marginTop: '12px', marginBottom: '12px' }}>
            Platné obchodní podmínky upravují vztahy mezi provozovatelem e-shopu a zákazníky. Objednáním zboží zákazník potvrzuje, že se seznámil s obchodními podmínkami a že s nimi souhlasí.
          </p>
        </div>

        <div className="mb-8" style={{ textAlign: 'center' }}>
          <h2 className="text-2xl font-bold mb-4 uppercase">Reklamace</h2>
          <p style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '19.6px', marginTop: '12px', marginBottom: '12px' }}>
            Reklamaci můžete uplatnit osobně na našich prodejnách, písemně na naší adrese nebo e-mailem. Více informací naleznete v reklamačním řádu.
          </p>
        </div>

        <div className="mb-8" style={{ textAlign: 'center' }}>
          <h2 className="text-2xl font-bold mb-4 uppercase">Ochrana osobních údajů</h2>
          <p style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '19.6px', marginTop: '12px', marginBottom: '12px' }}>
            Zpracování osobních údajů se řídí nařízením GDPR a zákonem o ochraně osobních údajů. Vaše osobní údaje používáme pouze k vyřízení objednávky a nebudou poskytnuty třetím stranám.
          </p>
        </div>

        <div className="border border-black p-6 bg-gray-50" style={{ textAlign: 'center' }}>
          <h3 className="text-lg font-bold mb-3 uppercase">Mimosoudní řešení sporů</h3>
          <p style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '19.6px', marginTop: '12px', marginBottom: '12px' }}>
            V případě sporu můžete využít služeb České obchodní inspekce nebo jiných subjektů mimosoudního řešení spotřebitelských sporů.
          </p>
        </div>
      </div>
    </div>
  );
}
