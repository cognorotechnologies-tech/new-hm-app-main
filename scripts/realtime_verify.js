const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runVerification() {
    console.log('--- E2E PRODUCT VERIFICATION (REAL-TIME) ---');

    try {
        // 1. Core Data Health
        const tenant = await prisma.tenant.findUnique({ where: { slug: 'demo' } });
        if (!tenant) throw new Error('Demo tenant missing');

        const doctor = await prisma.user.findFirst({
            where: { role: 'DOCTOR', tenantId: tenant.id }
        });
        if (!doctor) throw new Error('Doctor missing');

        const drProfile = await prisma.doctorProfile.findUnique({ where: { userId: doctor.id } });
        if (!drProfile) throw new Error('Doctor Profile missing');

        console.log(`✅ Environment Health: Demo Clinic Active | Dr. ${doctor.name} Ready`);

        // 2. Patient & Family Logic
        console.log('\n🧪 Testing Family Ecosystem...');

        // Find or create primary patient
        let patientUser = await prisma.user.findFirst({
            where: { email: 'test_primary@bharti.com' },
            include: { patientProfile: true }
        });

        if (!patientUser) {
            patientUser = await prisma.user.create({
                data: {
                    name: 'Primary Sponsor',
                    email: 'test_primary@bharti.com',
                    password: 'password123',
                    role: 'PATIENT',
                    tenantId: tenant.id
                }
            });
            const profile = await prisma.patientProfile.create({
                data: {
                    userId: patientUser.id,
                    tenantId: tenant.id,
                    gender: 'Female'
                }
            });
            patientUser.patientProfile = profile;
            console.log('✅ Created Primary Sponsor');
        } else {
            console.log('✅ Found Existing Primary Sponsor');
        }

        // Create Dependent
        const depId = `Child_${Math.floor(Math.random() * 1000)}`;
        const depUser = await prisma.user.create({
            data: {
                name: depId,
                email: `${depId.toLowerCase()}@bharti.com`,
                password: 'nopassword',
                role: 'PATIENT',
                tenantId: tenant.id
            }
        });
        const depProfile = await prisma.patientProfile.create({
            data: {
                userId: depUser.id,
                tenantId: tenant.id,
                parentId: patientUser.patientProfile.id,
                relationship: 'CHILD',
                dob: new Date('2022-01-01')
            }
        });
        console.log(`✅ Add Dependent: ${depId} Linked to Sponsor`);

        // 3. Clinical Workflow (Booking)
        console.log('\n🧪 Testing Clinical Workflow...');
        const appointment = await prisma.appointment.create({
            data: {
                startTime: new Date('2026-07-01T10:00:00Z'),
                endTime: new Date('2026-07-01T10:30:00Z'),
                status: 'SCHEDULED',
                reason: 'First Pediatric Visit',
                patientId: depProfile.id,
                doctorId: drProfile.id,
                tenantId: tenant.id
            },
            include: {
                patient: { include: { user: true } }
            }
        });

        console.log(`✅ Booking Logic: Created Appointment #${appointment.id}`);
        console.log(`✅ Attribution: Assigned to ${appointment.patient.user.name} (Dependent)`);

        // 4. Cleanup (Optional, but let's keep it for records)
        console.log('\n⭐ VERIFICATION COMPLETE: ALL SYSTEMS NOMINAL ⭐');

    } catch (e) {
        console.error('\n❌ VERIFICATION FAILED');
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

runVerification();
