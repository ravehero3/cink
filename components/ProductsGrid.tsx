'use client';

import ProductCard from './ProductCard';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
}

interface ProductsGridProps {
  products: Product[];
  savedProducts?: string[];
  onToggleSave?: (id: string) => void;
}

export default function ProductsGrid({ products, savedProducts = [], onToggleSave }: ProductsGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-product-name">Žádné produkty nenalezeny</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-black">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          slug={product.slug}
          price={Number(product.price)}
          image={product.images[0]}
          isSaved={savedProducts.includes(product.id)}
          onToggleSave={onToggleSave}
        />
      ))}
    </div>
  );
}
