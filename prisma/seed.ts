import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  {
    name: 'VOODOO808',
    slug: 'voodoo808',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    sortOrder: 1,
  },
  {
    name: 'SPACE LOVE',
    slug: 'space-love',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    sortOrder: 2,
  },
  {
    name: 'RECREATION WELLNESS',
    slug: 'recreation-wellness',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    sortOrder: 3,
  },
  {
    name: 'T SHIRT GALLERY',
    slug: 't-shirt-gallery',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    sortOrder: 4,
  },
];

const productTemplates = [
  { name: 'Tričko Classic', description: 'Klasické bavlněné tričko s minimalistickým designem. Vyrobeno z prémiové bavlny pro maximální pohodlí.', price: 790 },
  { name: 'Tričko Oversized', description: 'Volný oversized střih s moderním designem. Perfektní pro každodenní nošení.', price: 890 },
  { name: 'Tričko Premium', description: 'Prémiové tričko s vyšším gramážem. Nejvyšší kvalita materiálu a zpracování.', price: 990 },
  { name: 'Tričko Longline', description: 'Prodloužený střih pro moderní look. Ideální pro styling s vrstvením.', price: 850 },
  { name: 'Tričko Fitted', description: 'Slim fit střih pro dokonalé padnutí. Skvělé pro sportovní aktivity i volný čas.', price: 790 },
  { name: 'Tričko Pocket', description: 'Tričko s kapsičkou na prsou. Praktický detail s elegantním vzhledem.', price: 820 },
  { name: 'Tričko V-neck', description: 'Tričko s výstřihem do V. Elegantní a pohodlné pro každou příležitost.', price: 790 },
  { name: 'Tričko Raglan', description: 'Raglanové rukávy pro lepší pohyblivost. Sportovní styl s casual nádechem.', price: 880 },
  { name: 'Tričko Henley', description: 'Henley styl s knoflíky. Kombinace elegance a pohodlí.', price: 920 },
  { name: 'Tričko Striped', description: 'Tričko s jemnými pruhy. Nadčasový design pro každodenní nošení.', price: 850 },
];

const sizes = ['S', 'M', 'L', 'XL', '2XL'];
const colors = ['black', 'white'];

function normalizeSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  console.log('🌱 Starting seed...');

  console.log('📁 Creating categories...');
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  console.log('👕 Creating products...');
  let productCount = 0;

  for (const category of categories) {
    for (let i = 0; i < productTemplates.length; i++) {
      const template = productTemplates[i];
      const color = colors[i % colors.length];
      
      const sizesData = sizes.reduce((acc, size) => {
        const stock = Math.floor(Math.random() * 20) + 5;
        acc[size] = stock;
        return acc;
      }, {} as Record<string, number>);

      const totalStock = Object.values(sizesData).reduce((sum, stock) => sum + stock, 0);

      const slug = normalizeSlug(`${category.slug}-${template.name}-${color}`);
      
      const colorDisplay = color === 'black' ? 'Černá' : 'Bílá';
      const imageText = `${template.name.replace(/\s+/g, '+')}`;
      const bgColor = color === 'black' ? '000000' : 'FFFFFF';
      const textColor = color === 'black' ? 'FFFFFF' : '000000';

      await prisma.product.upsert({
        where: { slug },
        update: {},
        create: {
          name: `${template.name} - ${colorDisplay}`,
          slug,
          description: template.description,
          price: template.price,
          category: category.name,
          color,
          images: [
            `https://placehold.co/600x600/${bgColor}/${textColor}?text=${imageText}`,
            `https://placehold.co/600x600/${bgColor}/${textColor}?text=${imageText}+2`,
            `https://placehold.co/600x600/${bgColor}/${textColor}?text=${imageText}+3`,
          ],
          sizes: sizesData,
          totalStock,
          isVisible: true,
        },
      });

      productCount++;
    }
  }

  console.log(`✅ Seed completed! Created ${categories.length} categories and ${productCount} products.`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
