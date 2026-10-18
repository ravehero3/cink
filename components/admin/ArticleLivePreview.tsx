'use client';

import { useMemo } from 'react';
import {
  Monitor,
  Smartphone,
  ImageIcon,
  Instagram,
  Tag,
  ExternalLink,
  Sparkles,
  Calendar,
  User,
  FileText,
} from 'lucide-react';

export interface ArticlePreviewData {
  title: string;
  subtitle?: string;
  author?: string;
  category?: string;
  tags?: string;
  blocks: {
    hero?: string;
    'hero:credit'?: string;
    text1?: string;
    image1?: string;
    'image1:credit'?: string;
    text2?: string;
    instagram?: string;
    text3?: string;
    [key: string]: any;
  };
  published?: boolean;
  publishedAt?: string;
  slug?: string;
}

interface ArticleLivePreviewProps {
  article: ArticlePreviewData;
  viewMode: 'desktop' | 'mobile';
  setViewMode: (mode: 'desktop' | 'mobile') => void;
  zoom?: number;
  setZoom?: (zoom: number) => void;
}

export default function ArticleLivePreview({
  article,
  viewMode,
  setViewMode,
  zoom = 1,
  setZoom,
}: ArticleLivePreviewProps) {
  // Check whether all content fields are empty
  const allFieldsEmpty = useMemo(() => {
    const hasTitle = Boolean(article.title?.trim());
    const hasSubtitle = Boolean(article.subtitle?.trim());
    const hasAuthor = Boolean(article.author?.trim());
    const hasCategory = Boolean(article.category?.trim());
    const hasTags = Boolean(article.tags?.trim());
    const hasHero = Boolean(article.blocks?.hero);
    const hasText1 = Boolean(article.blocks?.text1?.trim());
    const hasImage1 = Boolean(article.blocks?.image1);
    const hasText2 = Boolean(article.blocks?.text2?.trim());
    const hasInstagram = Boolean(article.blocks?.instagram?.trim());
    const hasText3 = Boolean(article.blocks?.text3?.trim());

    return !(
      hasTitle ||
      hasSubtitle ||
      hasAuthor ||
      hasCategory ||
      hasTags ||
      hasHero ||
      hasText1 ||
      hasImage1 ||
      hasText2 ||
      hasInstagram ||
      hasText3
    );
  }, [article]);

  const todayDate = useMemo(() => {
    if (article.publishedAt) {
      return new Date(article.publishedAt).toLocaleDateString('cs-CZ');
    }
    return new Date().toLocaleDateString('cs-CZ');
  }, [article.publishedAt]);

  const parsedTags = useMemo(() => {
    if (!article.tags?.trim()) return [];
    return article.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }, [article.tags]);

  return (
    <div className="flex flex-col h-full bg-[#111111] border border-black overflow-hidden shadow-sm">
      {/* Top Header Bar of Preview */}
      <div className="bg-black text-white px-4 py-2.5 border-b border-[#262626] flex items-center justify-between gap-3 flex-wrap shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
          <p className="text-[11px] font-bold uppercase tracking-wider text-white">
            Živý náhled článku
          </p>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-[#222222] text-[#888888] border border-[#333333] hidden sm:inline-block">
            {allFieldsEmpty ? 'Prázdná šablona' : 'Live synchro'}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Zoom controls */}
          {setZoom && (
            <div className="flex items-center bg-[#1c1c1c] border border-[#333333] p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setZoom(0.8)}
                className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  zoom === 0.8 ? 'bg-white text-black' : 'text-[#888888] hover:text-white'
                }`}
                title="80% velikost (vejde se lépe na menší obrazovky)"
              >
                80%
              </button>
              <button
                type="button"
                onClick={() => setZoom(1)}
                className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  zoom === 1 ? 'bg-white text-black' : 'text-[#888888] hover:text-white'
                }`}
                title="100% původní velikost"
              >
                100%
              </button>
            </div>
          )}

          {/* Device switcher */}
          <div className="flex items-center bg-[#1c1c1c] border border-[#333333] p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('desktop')}
              className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                viewMode === 'desktop' ? 'bg-white text-black' : 'text-[#888888] hover:text-white'
              }`}
            >
              <Monitor size={12} />
              <span>Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('mobile')}
              className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                viewMode === 'mobile' ? 'bg-white text-black' : 'text-[#888888] hover:text-white'
              }`}
            >
              <Smartphone size={12} />
              <span>Mobil</span>
            </button>
          </div>

          {/* Open live article link if saved */}
          {article.slug && article.slug !== 'novy' && (
            <a
              href={`/magazin/${article.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#888888] hover:text-white border border-[#333333] p-1.5 hover:bg-[#222222] transition-colors"
              title="Otevřít článek v nové záložce na webu"
            >
              <ExternalLink size={13} />
            </a>
          )}
        </div>
      </div>

      {/* Main Canvas Scroll Area */}
      <div className="flex-1 overflow-y-auto bg-[#0c0c0c] p-3 sm:p-6 flex justify-center items-start">
        <div
          className="transition-all duration-200 mx-auto"
          style={{
            width: viewMode === 'mobile' ? 390 : '100%',
            maxWidth: viewMode === 'mobile' ? 390 : 760,
            transform: zoom !== 1 ? `scale(${zoom})` : undefined,
            transformOrigin: 'top center',
          }}
        >
          {viewMode === 'mobile' && (
            <div className="text-center text-[10px] text-[#666666] uppercase tracking-widest pb-2 font-mono">
              Mobilní zobrazení (390 px)
            </div>
          )}

          {/* Article Paper Body (matching live /magazin/[slug]) */}
          <div
            className={`bg-white text-black shadow-2xl transition-all ${
              viewMode === 'mobile'
                ? 'border-[6px] border-[#252525] rounded-[32px] overflow-hidden p-4 sm:p-6'
                : 'border border-neutral-300 p-6 sm:p-12'
            }`}
          >
            {/* Header: Category */}
            <div className="mb-4">
              {article.category?.trim() ? (
                <span className="magazin-crumb text-xs font-bold uppercase tracking-wider text-[#666666] inline-block">
                  {article.category}
                </span>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border border-dashed border-neutral-300 text-neutral-400 bg-neutral-50 select-none">
                  <Tag size={10} />
                  <span>[ Kategorie článku ]</span>
                </div>
              )}
            </div>

            {/* Header: Title (H1) */}
            <div className="mb-4">
              {article.title?.trim() ? (
                <h1
                  className="magazin-h1 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-black"
                  style={{
                    fontFamily:
                      '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                  }}
                >
                  {article.title}
                </h1>
              ) : (
                <div className="border border-dashed border-neutral-300 bg-neutral-50/70 p-4 sm:p-6 select-none">
                  <p
                    className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-neutral-300 leading-tight"
                    style={{
                      fontFamily:
                        '"Helvetica Neue Condensed Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
                    }}
                  >
                    [ Titul článku — napište v editoru ]
                  </p>
                </div>
              )}
            </div>

            {/* Header: Subtitle / Perex (H2) */}
            <div className="mb-6">
              {article.subtitle?.trim() ? (
                <h2
                  className="magazin-standfirst text-lg sm:text-xl text-[#333333] font-light leading-relaxed"
                  style={{
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  }}
                >
                  {article.subtitle}
                </h2>
              ) : (
                <div className="border border-dashed border-neutral-200 bg-neutral-50/40 p-3 select-none">
                  <p className="text-sm italic text-neutral-400">
                    [ Podtitul / perex — úvodní odstavec článku ]
                  </p>
                </div>
              )}
            </div>

            {/* Header: Byline (Author & Date) */}
            <div className="magazin-byline flex items-center gap-3 text-xs text-[#666666] pb-6 mb-8 border-b border-neutral-200">
              <div className="flex items-center gap-1.5">
                <User size={13} className="text-[#888888]" />
                {article.author?.trim() ? (
                  <span className="font-medium text-black">Od {article.author}</span>
                ) : (
                  <span className="text-neutral-400 italic">[ Jméno autora ]</span>
                )}
              </div>
              <span className="text-neutral-300">•</span>
              <div className="flex items-center gap-1.5 text-neutral-500">
                <Calendar size={13} className="text-[#888888]" />
                <span>{todayDate}</span>
              </div>
              {article.published ? (
                <span className="ml-auto text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Zveřejněno
                </span>
              ) : (
                <span className="ml-auto text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-neutral-100 text-neutral-600 border border-neutral-300">
                  Koncept
                </span>
              )}
            </div>

            {/* Hero Image (Hlavní obrázek 16:9) */}
            <div className="mb-8">
              {article.blocks?.hero ? (
                <figure className="space-y-1.5">
                  <div className="relative w-full aspect-video bg-neutral-100 overflow-hidden border border-neutral-200">
                    <img
                      src={article.blocks.hero}
                      alt={article.title || 'Hero obrázek'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {article.blocks['hero:credit'] && (
                    <p className="text-[11px] text-[#888888] font-mono">
                      © {article.blocks['hero:credit']}
                    </p>
                  )}
                </figure>
              ) : (
                <div className="relative w-full aspect-video border-2 border-dashed border-neutral-300 bg-neutral-50/70 flex flex-col items-center justify-center p-6 text-center select-none group">
                  <div className="w-10 h-10 rounded-full bg-neutral-200/60 flex items-center justify-center text-neutral-400 mb-2">
                    <ImageIcon size={20} />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    [ Hlavní obrázek článku (Hero 16:9) ]
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Nahrajte obrázek v sekci vlevo
                  </p>
                </div>
              )}
            </div>

            {/* Body Content Blocks */}
            <div className="space-y-6">
              {/* Text 1 */}
              <div>
                {article.blocks?.text1?.trim() ? (
                  <div
                    className="magazin-text text-base sm:text-lg leading-relaxed text-[#111111] whitespace-pre-line"
                    style={{
                      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    }}
                  >
                    {article.blocks.text1}
                  </div>
                ) : (
                  <div className="border border-dashed border-neutral-200 bg-neutral-50/50 p-4 select-none">
                    <div className="flex items-center gap-2 mb-2 text-neutral-400">
                      <FileText size={13} />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        [ 1. textový blok článku ]
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Zde se ihned po napsání v editoru zobrazí první část textu článku se správnou velikostí písma a řádkováním.
                    </p>
                  </div>
                )}
              </div>

              {/* Image 1 (Obrázek v textu 16:9) */}
              <div>
                {article.blocks?.image1 ? (
                  <figure className="space-y-1.5 my-6">
                    <div className="relative w-full aspect-video bg-neutral-100 overflow-hidden border border-neutral-200">
                      <img
                        src={article.blocks.image1}
                        alt="Obrázek v textu"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {article.blocks['image1:credit'] && (
                      <p className="text-[11px] text-[#888888] font-mono">
                        © {article.blocks['image1:credit']}
                      </p>
                    )}
                  </figure>
                ) : (
                  <div className="w-full aspect-video border-2 border-dashed border-neutral-200 bg-neutral-50/40 flex flex-col items-center justify-center p-6 text-center select-none my-4">
                    <div className="w-9 h-9 rounded-full bg-neutral-200/50 flex items-center justify-center text-neutral-400 mb-2">
                      <ImageIcon size={18} />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                      [ Obrázek uvnitř textu (16:9) ]
                    </p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      Volitelná fotografie rozdělující odstavce textu
                    </p>
                  </div>
                )}
              </div>

              {/* Text 2 */}
              <div>
                {article.blocks?.text2?.trim() ? (
                  <div
                    className="magazin-text text-base sm:text-lg leading-relaxed text-[#111111] whitespace-pre-line"
                    style={{
                      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    }}
                  >
                    {article.blocks.text2}
                  </div>
                ) : (
                  <div className="border border-dashed border-neutral-200 bg-neutral-50/50 p-4 select-none">
                    <div className="flex items-center gap-2 mb-2 text-neutral-400">
                      <FileText size={13} />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        [ 2. textový blok článku ]
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Druhá část textu navazující na vložený obrázek…
                    </p>
                  </div>
                )}
              </div>

              {/* Instagram Block */}
              <div>
                {article.blocks?.instagram?.trim() ? (
                  <div className="my-6 p-4 border border-neutral-300 bg-neutral-50 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shrink-0">
                        <Instagram size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-wider text-black">
                          Instagram příspěvek
                        </p>
                        <p className="text-[11px] font-mono text-neutral-600 truncate max-w-[280px]">
                          {article.blocks.instagram}
                        </p>
                      </div>
                    </div>
                    <a
                      href={article.blocks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-black text-white hover:bg-neutral-800 text-[10px] font-bold uppercase tracking-wider transition-colors shrink-0"
                    >
                      Otevřít post ↗
                    </a>
                  </div>
                ) : (
                  <div className="border border-dashed border-neutral-200 bg-neutral-50/40 p-3 my-4 flex items-center justify-center gap-2 text-neutral-400 select-none">
                    <Instagram size={14} />
                    <span className="text-xs uppercase tracking-wider">
                      [ Instagram příspěvek — volitelné URL ]
                    </span>
                  </div>
                )}
              </div>

              {/* Text 3 */}
              <div>
                {article.blocks?.text3?.trim() ? (
                  <div
                    className="magazin-text text-base sm:text-lg leading-relaxed text-[#111111] whitespace-pre-line"
                    style={{
                      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    }}
                  >
                    {article.blocks.text3}
                  </div>
                ) : (
                  <div className="border border-dashed border-neutral-200 bg-neutral-50/50 p-4 select-none">
                    <div className="flex items-center gap-2 mb-2 text-neutral-400">
                      <FileText size={13} />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        [ 3. textový blok / Závěr ]
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Závěrečný odstavec nebo shrnutí článku…
                    </p>
                  </div>
                )}
              </div>

              {/* Tags Section */}
              <div className="pt-6 border-t border-neutral-200">
                {parsedTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {parsedTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 border border-black text-xs font-bold uppercase tracking-wider bg-white text-black"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 select-none">
                    <span className="px-3 py-1 border border-dashed border-neutral-300 text-xs text-neutral-400 uppercase tracking-wider">
                      [ #tag1 ]
                    </span>
                    <span className="px-3 py-1 border border-dashed border-neutral-300 text-xs text-neutral-400 uppercase tracking-wider">
                      [ #tag2 ]
                    </span>
                    <span className="px-3 py-1 border border-dashed border-neutral-300 text-xs text-neutral-400 uppercase tracking-wider">
                      [ #tag3 ]
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <div className="bg-black text-[#666666] border-t border-[#262626] px-4 py-2 flex items-center justify-between text-[10px] uppercase tracking-wider shrink-0">
        <span>Vizuální shoda 1:1 s veřejnou stránkou magazínu UFO SPORT</span>
        <span>Režim: {viewMode === 'desktop' ? 'Desktop' : 'Mobil (390 px)'}</span>
      </div>
    </div>
  );
}
