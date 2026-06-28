import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- Database Diagnostic ---')

    const tenants = await prisma.tenant.findMany({
        select: { id: true, slug: true, name: true }
    })
    console.log('Tenants found:', tenants)

    const systemTenant = tenants.find(t => t.slug === 'system')
    if (systemTenant) {
        const users = await prisma.user.findMany({
            where: { tenantId: systemTenant.id },
            select: { id: true, email: true, role: true }
        })
        console.log('Users in system tenant:', users)
    } else {
        console.log('WARNING: "system" tenant NOT FOUND!')
    }

    const allUsersCount = await prisma.user.count()
    console.log('Total users in DB:', allUsersCount)
}

main()
    .catch((e) => {
        console.error('Error running diagnostic:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
