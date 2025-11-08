import Link from 'next/link';
import Titlebar from "@/components/Titlebar";
import Header2 from "@/components/Header2";

const categories = [
  { name: 'VOODOO808', slug: 'voodoo808' },
  { name: 'SPACE LOVE', slug: 'space-love' },
  { name: 'RECREATION WELLNESS', slug: 'recreation-wellness' },
  { name: 'T SHIRT GALLERY', slug: 't-shirt-gallery' },
];

export default function Home() {
  return (
    <>
      <Titlebar title="UFO SPORT" />
      <Header2 />
      
      <div className="max-w-container mx-auto px-lg py-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2xl">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/kategorie/${category.slug}`}
              className="group border border-black aspect-square flex items-center justify-center hover:bg-black hover:text-white transition-colors"
            >
              <h2 className="text-section-header font-bold uppercase tracking-tighter text-center px-lg">
                {category.name}
              </h2>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
