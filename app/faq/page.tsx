export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 uppercase tracking-wider">ČASTO KLADENÉ DOTAZY</h1>
      
      <div className="max-w-3xl">
        <div className="mb-8 border-b border-black pb-6">
          <h2 className="text-xl font-bold mb-3 uppercase">Jak mohu objednat?</h2>
          <p className="text-base leading-relaxed">
            Objednávku můžete provést přímo na našem e-shopu. Stačí si vybrat produkty, vložit je do košíku a postupovat podle pokynů v procesu objednávky.
          </p>
        </div>

        <div className="mb-8 border-b border-black pb-6">
          <h2 className="text-xl font-bold mb-3 uppercase">Jaké máte platební metody?</h2>
          <p className="text-base leading-relaxed">
            Akceptujeme platby kartou, bankovním převodem a dobírkou. Více informací najdete na stránce platby.
          </p>
        </div>

        <div className="mb-8 border-b border-black pb-6">
          <h2 className="text-xl font-bold mb-3 uppercase">Jak dlouho trvá doručení?</h2>
          <p className="text-base leading-relaxed">
            Standardní doba doručení je 2-5 pracovních dnů od potvrzení objednávky. Více informací najdete na stránce doručení.
          </p>
        </div>

        <div className="mb-8 pb-6">
          <h2 className="text-xl font-bold mb-3 uppercase">Mohu zboží vrátit?</h2>
          <p className="text-base leading-relaxed">
            Ano, zboží můžete vrátit do 14 dnů od převzetí. Více informací najdete na stránce vrácení zboží.
          </p>
        </div>
      </div>
    </div>
  );
}
