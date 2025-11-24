import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'user@ufosport.cz' }
    });

    if (existingUser) {
      console.log('Test user already exists!');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('user123', 10);

    // Create the test user
    const user = await prisma.user.create({
      data: {
        email: 'user@ufosport.cz',
        password: hashedPassword,
        name: 'Test User',
        role: 'USER'
      }
    });

    console.log('Test user created successfully!');
    console.log('Email: user@ufosport.cz');
    console.log('Password: user123');
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
