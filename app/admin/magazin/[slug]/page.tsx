'use client';

import { useParams, useRouter } from 'next/navigation';
import MagazineArticleEditor from '@/components/admin/MagazineArticleEditor';

export default function AdminArticleEditorPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  return (
    <MagazineArticleEditor
      initialSlug={slug}
      onBackToList={() => router.push('/admin/magazin')}
    />
  );
}
