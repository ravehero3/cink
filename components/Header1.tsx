'use client';

import Link from 'next/link';
import { useCartStore } from '@/lib/cart-store';
import { useSavedProductsStore } from '@/lib/saved-products-store';
import { useSession } from 'next-auth/react';

const categories = [
  { name: 'VOODOO808', slug: 'voodoo808' },
  { name: 'SPACE LOVE', slug: 'space-love' },
  { name: 'RECREATION WELLNESS', slug: 'recreation-wellness' },
  { name: 'T SHIRT GALLERY', slug: 't-shirt-gallery' },
];

export default function Header1() {
  const { data: session } = useSession();
  const cartCount = useCartStore((state) => state.getItemCount());
  const savedCount = useSavedProductsStore((state) => state.getCount());
  const isLoggedIn = !!session;
  const isAdmin = session?.user?.role === 'ADMIN';

  return (
    <header className="h-header border-b border-black bg-white">
      <div className="h-full flex items-center justify-between px-8">
        <nav className="flex gap-6">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/kategorie/${category.slug}`}
              className="text-body uppercase hover:underline"
            >
              {category.name}
            </Link>
          ))}
        </nav>

        <Link href="/" className="text-header font-bold">
          ufosport.cz
        </Link>

        <div className="flex items-center gap-6">
          {isAdmin && (
            <Link href="/admin" className="text-body uppercase hover:underline">
              ADMIN
            </Link>
          )}
          <Link href={isLoggedIn ? "/ucet" : "/prihlaseni"} className="text-body uppercase hover:underline">
            {isLoggedIn ? "MŮJ ÚČET" : "PŘIHLÁSIT SE"}
          </Link>

          <Link href="/ulozeno" className="relative">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {savedCount}
              </span>
            )}
          </Link>

          <Link href="/kosik" className="relative">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
