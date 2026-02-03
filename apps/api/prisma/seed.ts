import 'dotenv/config'; // Load env vars
import { PrismaClient, OpportunityType, EducationLevel, WorkMode } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.admin.upsert({
        where: { email: 'admin@jobplatform.com' },
        update: {},
        create: {
            email: 'admin@jobplatform.com',
            passwordHash: adminPassword,
            fullName: 'Platform Admin',
        },
    });

    console.log('✅ Admin created: admin@jobplatform.com / admin123');
    console.log('⚠️  CHANGE PASSWORD AFTER FIRST LOGIN!');

    // Cities for opportunities
    const cities = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata'];

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Helper: random date in future
    const futureDate = (daysAhead: number) => {
        const d = new Date();
        d.setDate(d.getDate() + daysAhead);
        return d;
    };

    // ========================================
    // SEED 20 JOBS
    // ========================================
    const jobTitles = [
        'Software Engineer', 'Frontend Developer', 'Backend Developer',
        'Full Stack Developer', 'Data Analyst', 'Product Manager',
        'DevOps Engineer', 'QA Engineer', 'Business Analyst',
        'UI/UX Designer', 'Mobile Developer', 'Cloud Engineer',
        'Database Administrator', 'Security Analyst', 'Technical Writer',
        'Sales Executive', 'Marketing Manager', 'HR Manager',
        'Content Writer', 'Graphic Designer'
    ];

    const companies = [
        'TechCorp', 'InnovateLabs', 'DataStream Inc', 'CloudNine Systems',
        'NextGen Solutions', 'Digital Pioneers', 'CodeCraft', 'ByteWorks',
        'InfoTech', 'SmartSolutions', 'Acme Corp', 'GlobalTech',
        'FutureSoft', 'AlphaData', 'BetaSystems'
    ];

    for (let i = 0; i < 20; i++) {
        const expiringSoon = i < 3; // First 3 expire soon
        const alreadyExpired = i >= 18; // Last 2 already expired

        await prisma.opportunity.create({
            data: {
                status: 'PUBLISHED',
                type: OpportunityType.JOB,
                title: jobTitles[i],
                company: companies[i % companies.length],
                description: `Join our team as a ${jobTitles[i]}. We offer competitive salary, growth opportunities, and a great work environment.`,
                allowedDegrees: i % 2 === 0
                    ? [EducationLevel.DEGREE, EducationLevel.PG]
                    : [EducationLevel.DEGREE],
                allowedPassoutYears: [2022, 2023, 2024, 2025],
                requiredSkills: i % 3 === 0 ? ['JavaScript', 'React'] : [],
                locations: [cities[i % cities.length], cities[(i + 1) % cities.length]],
                workMode: i % 2 === 0 ? WorkMode.ONSITE : WorkMode.HYBRID,
                salaryMin: 30000 + (i * 5000),
                salaryMax: 50000 + (i * 8000),
                applyLink: `https://careers.${companies[i % companies.length].toLowerCase()}.com/job-${i}`,
                expiresAt: alreadyExpired
                    ? futureDate(-2)
                    : expiringSoon
                        ? futureDate(2)
                        : futureDate(10 + i),
                postedByAdminId: admin.id,
            }
        });
    }

    console.log('✅ Seeded 20 jobs');

    // ========================================
    // SEED 20 INTERNSHIPS
    // ========================================
    const internTitles = [
        'Software Development Intern', 'Marketing Intern', 'Data Science Intern',
        'HR Intern', 'Content Writing Intern', 'Graphic Design Intern',
        'Business Development Intern', 'Sales Intern', 'Finance Intern',
        'Web Development Intern', 'Mobile App Intern', 'DevOps Intern',
        'Product Management Intern', 'UX Design Intern', 'Research Intern',
        'Operations Intern', 'Analytics Intern', 'Social Media Intern',
        'Customer Support Intern', 'Quality Assurance Intern'
    ];

    for (let i = 0; i < 20; i++) {
        await prisma.opportunity.create({
            data: {
                status: 'PUBLISHED',
                type: OpportunityType.INTERNSHIP,
                title: internTitles[i],
                company: companies[(i + 5) % companies.length],
                description: `6-month internship program for ${internTitles[i]}. Stipend provided. Great learning opportunity.`,
                allowedDegrees: [EducationLevel.DIPLOMA, EducationLevel.DEGREE],
                allowedPassoutYears: [2024, 2025, 2026],
                requiredSkills: [],
                locations: [cities[(i + 2) % cities.length]],
                workMode: i % 3 === 0 ? WorkMode.REMOTE : WorkMode.HYBRID,
                salaryMin: 10000 + (i * 500),
                salaryMax: 15000 + (i * 800),
                applyLink: `https://internships.${companies[(i + 5) % companies.length].toLowerCase()}.com/apply`,
                expiresAt: futureDate(5 + (i * 2)),
                postedByAdminId: admin.id,
            }
        });
    }

    console.log('✅ Seeded 20 internships');

    // ========================================
    // SEED 10 WALK-INS (5 multi-date)
    // ========================================
    const walkInCompanies = [
        'MegaCorp', 'TechGiants', 'StartupHub', 'InnovateCo', 'GlobalServices',
        'EliteRecruiters', 'PrimeTech', 'FutureCorp', 'DynamicSystems', 'ProServices'
    ];

    for (let i = 0; i < 10; i++) {
        const isMultiDate = i < 5; // First 5 are multi-date
        const dates = isMultiDate
            ? [futureDate(3 + i), futureDate(4 + i), futureDate(5 + i)]
            : [futureDate(7 + i)];

        const opp = await prisma.opportunity.create({
            data: {
                status: 'PUBLISHED',
                type: OpportunityType.WALKIN,
                title: `Walk-in Interview - ${i % 2 === 0 ? 'Multiple Positions' : 'Software Roles'}`,
                company: walkInCompanies[i],
                description: `Walk-in interview for freshers. Bring updated resume, ID proof, and certificates. Multiple positions available.`,
                allowedDegrees: [EducationLevel.DEGREE, EducationLevel.DIPLOMA],
                allowedPassoutYears: [2023, 2024, 2025],
                requiredSkills: [],
                locations: [cities[i % cities.length]],
                postedByAdminId: admin.id,
            }
        });

        await prisma.walkInDetails.create({
            data: {
                opportunityId: opp.id,
                dates: dates,
                venueAddress: `${walkInCompanies[i]} Office, ${i + 1}th Floor, Tech Park, ${cities[i % cities.length]}`,
                reportingTime: i % 2 === 0 ? '10:00 AM' : '2:00 PM',
                requiredDocuments: ['Resume', 'ID Proof', 'Education Certificates', 'Passport Photo'],
                contactPerson: `HR Team - ${walkInCompanies[i]}`,
                contactPhone: `+91-${9000000000 + i}`,
            }
        });
    }

    console.log('✅ Seeded 10 walk-ins (5 multi-date)');
    console.log('\n🎉 Seeding completed!');
    console.log(`📊 Total: 20 jobs, 20 internships, 10 walk-ins`);
    console.log(`🌍 Cities: ${cities.join(', ')}`);
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
