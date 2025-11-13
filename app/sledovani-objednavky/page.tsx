import PageFrame from '@/components/PageFrame';

export default function TrackingPage() {
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
          className="uppercase text-center mb-8"
          style={{
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '28px',
            fontWeight: 700,
            letterSpacing: '0.05em'
          }}
        >
          SLEDOVÁNÍ OBJEDNÁVKY
        </h1>
        
        <div>
          <p 
            className="text-center mb-12"
            style={{
              fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              lineHeight: '1.6'
            }}
          >
            Zadejte číslo vaší objednávky pro sledování stavu zásilky.
          </p>

          <div className="border-2 border-black p-8">
            <div className="mb-8">
              <label 
                className="block uppercase mb-2"
                style={{
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.05em'
                }}
              >
                Číslo objednávky
              </label>
              <input
                type="text"
                className="w-full border-2 border-black px-4 py-3 focus:outline-none bg-white"
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  borderRadius: '2px'
                }}
                placeholder="Např. ORD-123456"
              />
            </div>

            <div className="mb-8">
              <label 
                className="block uppercase mb-2"
                style={{
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.05em'
                }}
              >
                E-mail
              </label>
              <input
                type="email"
                className="w-full border-2 border-black px-4 py-3 focus:outline-none bg-white"
                style={{
                  fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  borderRadius: '2px'
                }}
                placeholder="vas@email.cz"
              />
            </div>

            <button 
              className="w-full bg-black text-white hover:opacity-90 transition-opacity"
              style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '12px',
                fontWeight: 400,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                borderRadius: '4px',
                padding: '13.8px 25.6px'
              }}
            >
              SLEDOVAT OBJEDNÁVKU
            </button>
          </div>

          <div className="mt-8 p-6 border-2 border-black bg-white">
            <p 
              style={{
                fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: '1.6'
              }}
            >
              <strong>Tip:</strong> Číslo objednávky a sledovací číslo najdete v potvrzovacím e-mailu, který jsme vám zaslali po vytvoření objednávky.
            </p>
          </div>
        </div>
      </div>
    </PageFrame>
  );
}
