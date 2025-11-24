import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@ufosport.cz';
  const userEmail = 'user@ufosport.cz';

  // Check if users already exist
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  const existingUser = await prisma.user.findUnique({ where: { email: userEmail } });

  // Hash passwords
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const userPasswordHash = await bcrypt.hash('user123', 10);

  // Create or update admin user
  if (existingAdmin) {
    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        password: adminPasswordHash,
        role: 'ADMIN',
        name: 'Admin User',
      },
    });
    console.log('✅ Admin user updated');
  } else {
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: adminPasswordHash,
        role: 'ADMIN',
        name: 'Admin User',
      },
    });
    console.log('✅ Admin user created');
  }

  // Create or update regular user
  if (existingUser) {
    await prisma.user.update({
      where: { email: userEmail },
      data: {
        password: userPasswordHash,
        role: 'USER',
        name: 'Regular User',
      },
    });
    console.log('✅ Regular user updated');
  } else {
    await prisma.user.create({
      data: {
        email: userEmail,
        password: userPasswordHash,
        role: 'USER',
        name: 'Regular User',
      },
    });
    console.log('✅ Regular user created');
  }

  console.log('\nTest users ready:');
  console.log('Admin: admin@ufosport.cz / admin123');
  console.log('User: user@ufosport.cz / user123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
