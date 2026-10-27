'use client';

import Link from 'next/link';
import Image from 'next/image';

interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  category?: string;
  author?: string;
  blocks: any;
  publishedAt?: string;
  viewCount?: number;
}

interface RecommendSectionProps {
  articles: Article[];
}

export default function RecommendSection({ articles }: RecommendSectionProps) {
  if (!articles || articles.length === 0) return null;

  // Helper to ensure absolute URLs
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
      return `před ${diffHours} hodinou${diffHours === 1 ? '' : 'mi'}`;
    } else if (diffDays < 30) {
      return `před ${diffDays} dnem${diffDays === 1 ? '' : 'y'}`;
    } else if (diffMonths < 12) {
      return `před ${diffMonths} měsícem${diffMonths === 1 ? '' : 'i'}`;
    } else {
      return `před ${diffYears} rokem${diffYears === 1 ? '' : 'y'}`;
    }
  }

  return (
    <section className="magazine-recommend py-12 md:py-16 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <h2 className="recommend__heading text-2xl md:text-[26px] font-bold uppercase mb-7 md:mb-7 tracking-tight">
          Doporučujeme
        </h2>

        <ul className="recommend__grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-5 lg:gap-5 list-none">
          {articles.map((article) => (
            <li key={article.id} className="card flex flex-col">
              <Link
                href={`/magazin/${article.slug}`}
                className="card__link flex flex-col flex-1 text-inherit no-underline group"
              >
                {/* Media / Image */}
                {article.blocks.hero && (
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
                <h3 className="card__title text-xl md:text-[25px] font-bold leading-[1.16] mt-3.5 md:mt-3.5 min-h-[calc(2*1.16em)]">
                  {article.title}
                </h3>

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
      </div>
    </section>
  );
}
