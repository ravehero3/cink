import CategoryClientPage from './CategoryClientPage';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { slug: string };
}

export default function CategoryPage({ params }: PageProps) {
  return <CategoryClientPage slug={params.slug} />;
}
