const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, name: true, images: true }
  });
  console.dir(products, { depth: null });
}
main().catch(console.error).finally(() => prisma.$disconnect());
