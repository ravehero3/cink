import Link from 'next/link';

export default function UnsubscribePage({ searchParams }: { searchParams: { chyba?: string } }) {
  const isError = searchParams?.chyba === '1';

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <p className="text-2xl font-bold tracking-tight mb-3">
          {isError ? 'Neplatný odkaz' : 'Odhlášení proběhlo'}
        </p>
        <p className="text-sm text-gray-500 mb-8">
          {isError
            ? 'Odkaz pro odhlášení je neplatný nebo vypršel.'
            : 'Byli jste úspěšně odhlášeni z odběru novinek UFO Sport.'}
        </p>
        <Link href="/" className="text-sm underline underline-offset-4">
          Zpět na e-shop
        </Link>
      </div>
    </div>
  );
}
