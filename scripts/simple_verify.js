const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    console.log('STEP 1: Checking Core Data...');
    const tenant = await prisma.tenant.findUnique({ where: { slug: 'demo' } });
    console.log('Tenant OK:', tenant.id);

    const doctor = await prisma.doctorProfile.findFirst({
        where: { tenantId: tenant.id },
        include: { user: true }
    });
    console.log('Doctor OK:', doctor.user.name);

    console.log('\nSTEP 2: Creating Patient...');
    const email = `test_p_${Date.now()}@example.com`;
    const user = await prisma.user.create({
        data: {
            name: 'Verification Primary',
            email: email,
            password: 'password123',
            role: 'PATIENT',
            tenantId: tenant.id
        }
    });
    const profile = await prisma.patientProfile.create({
        data: {
            userId: user.id,
            tenantId: tenant.id,
            gender: 'Female'
        }
    });
    console.log('Primary Patient OK:', profile.id);

    console.log('\nSTEP 3: Creating Dependent...');
    const depEmail = `test_d_${Date.now()}@example.com`;
    const depUser = await prisma.user.create({
        data: {
            name: 'Verification Dependent',
            email: depEmail,
            password: 'password123',
            role: 'PATIENT',
            tenantId: tenant.id
        }
    });
    const depProfile = await prisma.patientProfile.create({
        data: {
            userId: depUser.id,
            tenantId: tenant.id,
            parentId: profile.id,
            relationship: 'CHILD'
        }
    });
    console.log('Dependent OK:', depProfile.id);

    console.log('\nSTEP 4: Booking Appointment...');
    const appointment = await prisma.appointment.create({
        data: {
            startTime: new Date('2026-08-01T10:00:00Z'),
            endTime: new Date('2026-08-01T10:30:00Z'),
            reason: 'Verification Check',
            patientId: depProfile.id,
            doctorId: doctor.id,
            tenantId: tenant.id
        }
    });
    console.log('Booking OK:', appointment.id);

    console.log('\n⭐ VERIFICATION SUCCESSFUL ⭐');
}

run().catch(e => {
    console.error('❌ FAILED at step:', e.message);
    console.error(e);
    process.exit(1);
}).finally(() => prisma.$disconnect());
