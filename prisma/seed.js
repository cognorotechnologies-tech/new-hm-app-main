const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create Tenant
    const tenant = await prisma.tenant.upsert({
        where: { slug: 'demo' },
        update: {},
        create: {
            name: 'Demo Clinic',
            slug: 'demo',
            plan: 'PROFESSIONAL',
        },
    });

    console.log({ tenant });

    // Create User
    const user = await prisma.user.upsert({
        where: {
            email_tenantId: {
                email: 'doctor@demo.com',
                tenantId: tenant.id
            }
        },
        update: {},
        create: {
            email: 'doctor@demo.com',
            name: 'Dr. Smith',
            password: hashedPassword,
            role: 'DOCTOR',
            tenantId: tenant.id,
        },
    });

    console.log({ user });

    // Create Doctor Profile
    await prisma.doctorProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
            userId: user.id,
            tenantId: tenant.id,
            specialization: 'General Practice',
            availability: { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], hours: '9:00-17:00' }
        }
    });

    // Create Tenant Admin
    const tenantAdmin = await prisma.user.upsert({
        where: {
            email_tenantId: {
                email: 'admin@demo.com',
                tenantId: tenant.id
            }
        },
        update: {},
        create: {
            email: 'admin@demo.com',
            name: 'Tenant Admin',
            password: hashedPassword,
            role: 'ADMIN',
            tenantId: tenant.id,
        },
    });
    console.log({ tenantAdmin });

    // Create Super Admin Tenant (System)
    const systemTenant = await prisma.tenant.upsert({
        where: { slug: 'system' },
        update: {},
        create: {
            name: 'System Admin',
            slug: 'system',
            plan: 'ENTERPRISE',
        },
    });

    // Create Super Admin
    const superAdmin = await prisma.user.upsert({
        where: {
            email_tenantId: {
                email: 'admin@system.com',
                tenantId: systemTenant.id
            }
        },
        update: {},
        create: {
            email: 'admin@system.com',
            name: 'Super Admin',
            password: hashedPassword,
            role: 'SUPER_ADMIN',
            tenantId: systemTenant.id,
        },
    });

    console.log({ superAdmin });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
