'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header1 from '@/components/Header1';
import Footer from '@/components/Footer';

interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  category?: string;
  author?: string;
  tags?: string;
  blocks: any;
  publishedAt: string;
}

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchArticle();
  }, [slug]);

  const fetchArticle = async () => {
    try {
      const res = await fetch(`/api/magazine/articles/${slug}`);
      if (!res.ok) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setArticle(data);

      // Fetch related articles
      const allRes = await fetch('/api/magazine/articles');
      const all: Article[] = await allRes.json();
      const related = all
        .filter((a) => a.slug !== slug)
        .slice(0, 3);
      setRelatedArticles(related);
    } catch (error) {
      console.error('Error fetching article:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p>Načítání...</p>
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header1 />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">404</h1>
            <p className="text-gray-600 mb-6">Článek nebyl nalezen.</p>
            <Link href="/magazin" className="text-blue-600 hover:underline">
              Zpět na Magazín
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const publishedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('cs-CZ')
    : '';

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header1 />

      <main className="flex-1">
        {/* Article header */}
        <article className="magazin-article">
          <div className="magazin-article-header max-w-3xl mx-auto px-4 md:px-8 py-12">
            {article.category && (
              <Link href="/magazin" className="magazin-crumb text-sm uppercase font-semibold text-gray-600 hover:text-black mb-4 inline-block">
                {article.category}
              </Link>
            )}

            <h1 className="magazin-h1 text-5xl font-bold mb-4 leading-tight">
              {article.title}
            </h1>

            {article.subtitle && (
              <h2 className="magazin-standfirst text-2xl text-gray-700 font-light mb-6">
                {article.subtitle}
              </h2>
            )}

            <div className="magazin-byline flex items-center gap-4 text-sm text-gray-600 pb-8 border-b border-gray-200">
              <span>Od {article.author || 'Redakce'}</span>
              <span>•</span>
              <span>{publishedDate}</span>
            </div>
          </div>

          {/* Hero image */}
          {article.blocks.hero && (
            <div className="magazin-hero-image max-w-4xl mx-auto px-4 md:px-8 my-12">
              <div className="relative w-full aspect-video bg-gray-100 overflow-hidden">
                <Image
                  src={article.blocks.hero}
                  alt={article.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              {article.blocks['hero:credit'] && (
                <p className="text-xs text-gray-500 mt-2">© {article.blocks['hero:credit']}</p>
              )}
            </div>
          )}

          {/* Article body */}
          <div className="magazin-body max-w-2xl mx-auto px-4 md:px-8 py-12">
            {/* Render blocks */}
            {article.blocks.text1 && (
              <p className="magazin-text mb-8 text-lg leading-relaxed">
                {article.blocks.text1}
              </p>
            )}

            {article.blocks.image1 && (
              <figure className="magazin-figure my-12">
                <div className="relative w-full aspect-video bg-gray-100 overflow-hidden mb-2">
                  <Image
                    src={article.blocks.image1}
                    alt="Article image"
                    fill
                    className="object-cover"
                  />
                </div>
                {article.blocks['image1:credit'] && (
                  <figcaption className="text-xs text-gray-500">
                    © {article.blocks['image1:credit']}
                  </figcaption>
                )}
              </figure>
            )}

            {article.blocks.text2 && (
              <p className="magazin-text mb-8 text-lg leading-relaxed">
                {article.blocks.text2}
              </p>
            )}

            {article.blocks.instagram && (
              <div className="magazin-instagram my-12 flex justify-center">
                <div style={{ maxWidth: '540px', width: '100%' }}>
                  <blockquote
                    className="instagram-media"
                    data-instgrm-permalink={article.blocks.instagram}
                    data-instgrm-version="14"
                    style={{
                      background: '#fff',
                      border: 0,
                      margin: '0 auto',
                      padding: 0,
                      width: '100%',
                    }}
                  >
                    <a href={article.blocks.instagram} target="_blank" rel="noopener">
                      Zobrazit příspěvek na Instagramu
                    </a>
                  </blockquote>
                </div>
              </div>
            )}

            {article.blocks.text3 && (
              <p className="magazin-text mb-8 text-lg leading-relaxed">
                {article.blocks.text3}
              </p>
            )}
          </div>

          {/* Tags */}
          {article.tags && (
            <div className="magazin-tags max-w-2xl mx-auto px-4 md:px-8 py-8 border-t border-gray-200 flex flex-wrap gap-2">
              {article.tags.split(',').map((tag) => (
                <span
                  key={tag.trim()}
                  className="px-3 py-1 border border-black text-sm uppercase"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}
        </article>

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <section className="magazin-related py-16 md:py-24 bg-gray-50 border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
              <h2 className="magazin-related-title text-2xl font-bold mb-12">
                Doporučujeme
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedArticles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/magazin/${article.slug}`}
                    className="magazin-related-card hover:opacity-80 transition-opacity"
                  >
                    {article.blocks.hero && (
                      <div className="relative w-full h-40 bg-gray-100 mb-4 overflow-hidden">
                        <Image
                          src={article.blocks.hero}
                          alt={article.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <h3 className="font-bold text-lg line-clamp-2">{article.title}</h3>
                    <p className="text-sm text-gray-600 mt-2">
                      {article.category}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />

      {/* Load Instagram embed script */}
      {article.blocks.instagram && (
        <script async src="https://www.instagram.com/embed.js"></script>
      )}
    </div>
  );
}
