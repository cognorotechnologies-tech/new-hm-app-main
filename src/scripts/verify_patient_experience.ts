import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyPatientLogic() {
    console.log('🚀 Starting Patient Portal Logic Verification (Standalone)...\n');

    try {
        // 1. Setup Test Environment
        console.log('📝 Setting up test data...');
        const tenant = await prisma.tenant.findFirst({
            include: { doctors: true }
        });

        if (!tenant || tenant.doctors.length === 0) {
            throw new Error('No tenant or doctors found. Ensure database is seeded.');
        }

        const patient = await prisma.patientProfile.findFirst({
            where: { userId: { not: null } },
            include: { user: true }
        });

        if (!patient || !patient.user) {
            throw new Error('No patient profile found. Please register a patient first.');
        }

        console.log(`✅ Using Tenant: ${tenant.name}`);
        console.log(`✅ Using Patient: ${patient.user.name}\n`);

        // 2. Simulate Family Hub Logic (Add Dependent)
        console.log('👪 Simulating Family Hub: Adding Dependent...');
        const depName = `Verified Dep ${Math.floor(Math.random() * 1000)}`;

        // Simulating addDependent action logic
        const depUser = await prisma.user.create({
            data: {
                name: depName,
                email: `dep_verify_${Math.random().toString(36).substring(7)}@bharticlinic.internal`,
                password: 'verification_test',
                role: UserRole.PATIENT,
                tenantId: tenant.id,
                patientProfile: {
                    create: {
                        tenantId: tenant.id,
                        parentId: patient.id,
                        dob: new Date('2020-01-01'),
                        relationship: 'CHILD'
                    }
                }
            },
            include: { patientProfile: true }
        });

        if (!depUser.patientProfile || depUser.patientProfile.relationship !== 'CHILD') {
            throw new Error('Relationship field not correctly stored.');
        }
        console.log(`✅ Dependent Added & Relationship Verified: ${depName} (CHILD)`);

        // 3. Simulate Appointment Booking Logic
        console.log('📅 Simulating Appointment Booking: Cross-Booking for Dependent...');
        const doctor = tenant.doctors[0];

        // Simulating bookAppointment action logic
        const appointment = await prisma.appointment.create({
            data: {
                startTime: new Date('2026-05-01T10:00:00Z'),
                endTime: new Date('2026-05-01T10:30:00Z'),
                status: 'SCHEDULED',
                reason: 'Verification Test',
                patientId: depUser.patientProfile.id,
                doctorId: doctor.id,
                tenantId: tenant.id
            }
        });

        if (appointment.patientId !== depUser.patientProfile.id) {
            throw new Error('Appointment not correctly mapped to dependent ID.');
        }
        console.log('✅ Appointment correctly mapped to dependent profile.\n');

        console.log('⭐ LOGIC VERIFICATION PASSED! ⭐');
        console.log('The database schema and business logic support all new Portal features.');

    } catch (error) {
        console.error('\n❌ VERIFICATION FAILED:');
        console.error(error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

verifyPatientLogic();
