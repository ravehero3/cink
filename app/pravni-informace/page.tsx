import PageFrame from '@/components/PageFrame';

export default function LegalPage() {
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
          className="uppercase mb-16" 
          style={{ 
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '28px',
            fontWeight: 700,
            letterSpacing: '0.05em',
            lineHeight: '1.2'
          }}
        >
          PRÁVNÍ INFORMACE
        </h1>
        
        <div className="space-y-12">
          <section>
            <h2 
              className="uppercase mb-6" 
              style={{ 
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '16px',
                fontWeight: 700,
                letterSpacing: '0.05em'
              }}
            >
              1. Provozovatel e-shopu
            </h2>
            <div 
              className="space-y-3"
              style={{ 
                fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', 
                fontSize: '14px', 
                fontWeight: 400, 
                lineHeight: '1.6',
                color: '#000000'
              }}
            >
              <p><strong>Název:</strong> Vojtěch Vojkovský, Bachelor of Arts</p>
              <p><strong>Sídlo:</strong> Třebechovice pod Orebem</p>
              <p><strong>IČO:</strong> 08701032</p>
            </div>
          </section>

          <section>
            <h2 
              className="uppercase mb-6" 
              style={{ 
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '16px',
                fontWeight: 700,
                letterSpacing: '0.05em'
              }}
            >
              2. Obchodní podmínky
            </h2>
            <p 
              style={{ 
                fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', 
                fontSize: '14px', 
                fontWeight: 400, 
                lineHeight: '1.6',
                color: '#000000'
              }}
            >
              Platné obchodní podmínky upravují vztahy mezi provozovatelem e-shopu a zákazníky. Objednáním zboží zákazník potvrzuje, že se seznámil s obchodními podmínkami a že s nimi souhlasí.
            </p>
          </section>

          <section>
            <h2 
              className="uppercase mb-6" 
              style={{ 
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '16px',
                fontWeight: 700,
                letterSpacing: '0.05em'
              }}
            >
              3. Reklamace
            </h2>
            <p 
              style={{ 
                fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', 
                fontSize: '14px', 
                fontWeight: 400, 
                lineHeight: '1.6',
                color: '#000000'
              }}
            >
              Reklamaci můžete uplatnit e-mailem. Více informací naleznete v reklamačním řádu.
            </p>
          </section>

          <section>
            <h2 
              className="uppercase mb-6" 
              style={{ 
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '16px',
                fontWeight: 700,
                letterSpacing: '0.05em'
              }}
            >
              4. Ochrana osobních údajů
            </h2>
            <p 
              style={{ 
                fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', 
                fontSize: '14px', 
                fontWeight: 400, 
                lineHeight: '1.6',
                color: '#000000'
              }}
            >
              Zpracování osobních údajů se řídí nařízením GDPR a zákonem o ochraně osobních údajů. Vaše osobní údaje používáme pouze k vyřízení objednávky a nebudou poskytnuty třetím stranám.
            </p>
          </section>
        </div>
      </div>
    </PageFrame>
  );
}
