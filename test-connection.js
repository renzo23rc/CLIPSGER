const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Conexión exitosa a Supabase!');
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.log('❌ Error de conexión:', error.message);
    process.exit(1);
  }
}

testConnection();
