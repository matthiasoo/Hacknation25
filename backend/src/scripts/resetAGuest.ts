
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = process.argv[2];
    if (!email) {
        console.log('Please provide email prefix or full email. Searching for "A Guest" by name if not provided.');
    }

    // Find user by name "A Guest" (FirstName=A, LastName=Guest) as seen in screenshot
    const user = await prisma.user.findFirst({
        where: {
            firstName: 'A',
            lastName: 'Guest'
        }
    });

    if (!user) {
        console.error('User "A Guest" not found');
        return;
    }

    console.log(`Found user: ${user.firstName} ${user.lastName} (${user.id})`);
    console.log(`Current Points: ${user.totalPoints}`);

    // Delete visits
    const deletedVisits = await prisma.userLocations.deleteMany({
        where: { userId: user.id }
    });

    console.log(`Deleted ${deletedVisits.count} visits.`);

    // Reset points
    const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { totalPoints: 0 }
    });

    console.log(`Reset points to 0.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
