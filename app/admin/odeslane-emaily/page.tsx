import Link from 'next/link';
import SentEmailsViewer from '@/components/admin/SentEmailsViewer';

export const metadata = {
  title: 'Odeslané e-maily | UFO SPORT Admin',
  description: 'Kompletní přehled a vizuální náhled všech e-mailů odeslaných zákazníkům.',
};

export default function SentEmailsPage() {
  return (
    <div className="space-y-6" style={{ fontFamily: 'BB-Regular, "Helvetica Neue", Helvetica, Arial, sans-serif' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-black gap-3">
        <div>
          <h1 className="admin-title">Odeslané e-maily</h1>
          <p className="admin-sub">
            Kompletní historie a vizuální kontrola e-mailů odeslaných zákazníkům UFO SPORT
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/emaily"
            className="px-4 py-2 text-xs uppercase tracking-wider font-medium border border-black bg-white text-black hover:bg-black hover:text-white transition-colors"
          >
            Šablony e-mailů
          </Link>
          <Link
            href="/admin/email-campaigns"
            className="px-4 py-2 text-xs uppercase tracking-wider font-medium border border-black bg-white text-black hover:bg-black hover:text-white transition-colors"
          >
            E-mail kampaně
          </Link>
        </div>
      </div>

      {/* Main Sent Emails Viewer */}
      <SentEmailsViewer />
    </div>
  );
}
