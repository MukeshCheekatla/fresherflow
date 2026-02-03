import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log('Successfully connected to the database');
  } catch (e: any) {
    console.error('Connection error:', e.message);
    console.error('Full error:', JSON.stringify(e, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main();
