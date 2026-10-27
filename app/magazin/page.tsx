'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header1 from '@/components/Header1';
import Footer from '@/components/Footer';
import { getArticleMetadata } from '@/lib/magazine-analytics';
import { generateMagazineCollectionSchema } from '@/lib/magazine-seo';

interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  category?: string;
  author?: string;
  blocks: any;
  publishedAt: string;
}

// Helper to ensure absolute URLs for images
function ensureAbsoluteImageUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const origin = typeof window !== 'undefined' ? window.location.origin : process.env.NEXTAUTH_URL || 'https://www.ufosport.cz';
  return `${origin}${url.startsWith('/') ? url : `/${url}`}`;
}

// Helper to format date in Czech
function formatDate(publishedAt?: string): string {
  if (!publishedAt) return '';
  const date = new Date(publishedAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffMins < 60) {
    return `před ${diffMins} minutou${diffMins === 1 ? '' : 'mi'}`;
  } else if (diffHours < 24) {
    return `před ${diffHours} hodinou${diffHours === 1 ? '' : 'ami'}`;
  } else if (diffDays < 30) {
    return `před ${diffDays} dnem${diffDays === 1 ? '' : 'y'}`;
  } else if (diffMonths < 12) {
    return `před ${diffMonths} měsícem${diffMonths === 1 ? '' : 'i'}`;
  } else {
    return `před ${diffYears} rokem${diffYears === 1 ? '' : 'y'}`;
  }
}

export default function MagazinePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  // Generate JSON-LD schema for collection
  const collectionSchema = generateMagazineCollectionSchema();

  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/magazine/articles');
      const data = await res.json();
      setArticles(data);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header1 />
      
      <main className="flex-1">
        {/* Hero section */}
        <section className="magazin-hero border-b border-black py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <h1 className="magazin-title text-3xl md:text-[26px] font-bold uppercase mb-2 md:mb-4 tracking-tight">
              Magazín
            </h1>
            <p className="magazin-subtitle text-base md:text-lg text-gray-600">
              Inspirace a tipy ze světa UFO SPORT
            </p>
          </div>
        </section>

        {/* Articles grid */}
        <section className="magazin-grid py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            {loading ? (
              <p className="text-center text-gray-500">Načítání...</p>
            ) : articles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">Zatím zde nejsou žádné články.</p>
                <p className="text-sm text-gray-400">Vraťte se brzy!</p>
              </div>
            ) : (
              <ul className="recommend__grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-5 lg:gap-5 list-none">
                {articles.map((article) => (
                  <li key={article.id} className="card flex flex-col">
                    <Link
                      href={`/magazin/${article.slug}`}
                      className="card__link flex flex-col flex-1 text-inherit no-underline group"
                    >
                      {/* Media / Image - only show if exists and not empty */}
                      {article.blocks.hero && article.blocks.hero.trim() !== '' && (
                        <div className="card__media relative w-full aspect-video bg-gray-100 overflow-hidden mb-3.5 md:mb-3.5">
                          <Image
                            src={ensureAbsoluteImageUrl(article.blocks.hero)}
                            alt={article.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}

                      {/* Title */}
                      <h2 className="card__title text-xl md:text-[25px] font-bold leading-[1.16] mt-3.5 md:mt-3.5 min-h-[calc(2*1.16em)]">
                        {article.title}
                      </h2>

                      {/* Meta */}
                      <p className="card__meta text-base md:text-[17px] font-normal leading-[1.2] uppercase mt-9 md:mt-9 group-hover:underline group-hover:underline-offset-1">
                        {article.category && <span>({article.category}) </span>}
                        {article.author && <span>{article.author} </span>}
                        {article.publishedAt && <span>/ {formatDate(article.publishedAt)}</span>}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>

      <Footer />

      {/* JSON-LD Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionSchema),
        }}
      />
    </div>
  );
}
