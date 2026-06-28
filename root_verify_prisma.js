require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Verifying Prisma connection...');
    try {
        const tenantCount = await prisma.tenant.count();
        console.log(`✅ Connection successful! Found ${tenantCount} tenants.`);
    } catch (e) {
        console.error('❌ Connection failed:', e.message);
        console.log('-> Please ensure your .env file has the correct DATABASE_URL.');
    } finally {
        await prisma.$disconnect();
    }
}

main();
