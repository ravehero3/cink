import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: 'voodoo808' }
    });

    if (!category) {
      console.log('❌ Category not found');
      process.exit(1);
    }

    console.log('Found category:', category.name, 'ID:', category.id);

    const updated = await prisma.category.update({
      where: { slug: 'voodoo808' },
      data: { videoUrl: '/voodoo808-banner.mov' }
    });

    console.log('✓ Updated successfully!');
    console.log('Video URL:', updated.videoUrl);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
