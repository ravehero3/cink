export default function TrackingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 uppercase tracking-wider text-center">SLEDOVÁNÍ OBJEDNÁVKY</h1>
      
      <div className="max-w-2xl mx-auto">
        <p style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '19.6px', marginTop: '12px', marginBottom: '12px', textAlign: 'center' }}>
          Zadejte číslo vaší objednávky pro sledování stavu zásilky.
        </p>

        <div className="border border-black p-8">
          <div className="mb-6">
            <label className="block text-sm font-bold mb-2 uppercase">
              Číslo objednávky
            </label>
            <input
              type="text"
              className="w-full border border-black px-4 py-3 text-base"
              placeholder="Např. ORD-123456"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold mb-2 uppercase">
              E-mail
            </label>
            <input
              type="email"
              className="w-full border border-black px-4 py-3 text-base"
              placeholder="vas@email.cz"
            />
          </div>

          <button className="w-full bg-black text-white py-3 text-sm uppercase tracking-wider font-bold hover:opacity-90 transition-opacity">
            SLEDOVAT OBJEDNÁVKU
          </button>
        </div>

        <div className="mt-8 p-6 bg-gray-100" style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '19.6px', marginTop: '12px', marginBottom: '12px' }}>
            <strong>Tip:</strong> Číslo objednávky a sledovací číslo najdete v potvrzovacím e-mailu, který jsme vám zaslali po vytvoření objednávky.
          </p>
        </div>
      </div>
    </div>
  );
}
