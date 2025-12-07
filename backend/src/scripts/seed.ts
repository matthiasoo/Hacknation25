import prisma from '../config/prisma';
import { LocationCategory } from '@prisma/client';

const seed = async () => {
    console.log('Seeding database...');

    // locations
    const locations = [
        {
            name: 'Spichrze nad Brdą',
            latitude: 53.12176,
            longitude: 18.00331,
            category: LocationCategory.MEMORIAL,
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Spichrze_nad_Brd%C4%85_w_Bydgoszczy_2013.jpg/800px-Spichrze_nad_Brd%C4%85_w_Bydgoszczy_2013.jpg',
            description: 'Zabytkowe spichrze zbożowe w Bydgoszczy, symbol miasta.',
            timeline: [
                {
                    year: 1793,
                    description: 'Budowa pierwszych spichrzy.',
                },
                {
                    year: 1964,
                    description: 'Pożar dwóch spichrzy.',
                },
            ],
        },
        {
            name: 'Wyspa Młyńska',
            latitude: 53.123,
            longitude: 17.996,
            category: LocationCategory.PARK, // or MUSEUM
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Wyspa_Mlynska_Bydgoszcz_2.jpg/800px-Wyspa_Mlynska_Bydgoszcz_2.jpg',
            description: 'Zabytkowa wyspa rzeczna w centrum Bydgoszczy.',
            timeline: [
                {
                    year: 1500,
                    description: 'Rozwój młynów królewskich.',
                },
                {
                    year: 2004,
                    description: 'Rewitalizacja wyspy i przekształcenie w teren rekreacyjny.',
                },
            ],
        },
        {
            name: 'Bydgoski Kanał',
            latitude: 53.125,
            longitude: 17.95,
            category: LocationCategory.OTHER,
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Kanal_bydgoski_zima_2.jpg/800px-Kanal_bydgoski_zima_2.jpg',
            description: 'Najstarszy czynny śródlądowy kanał wodny w Polsce.',
            timeline: [
                {
                    year: 1774,
                    description: 'Uruchomienie kanału.',
                },
            ],
        },
    ];

    for (const loc of locations) {
        const { timeline, ...locationData } = loc;
        const location = await prisma.location.create({
            data: locationData,
        });
        console.log(`Created location: ${location.name}`);

        if (timeline) {
            for (const event of timeline) {
                await prisma.locationDescription.create({
                    data: {
                        locationId: location.id,
                        year: event.year,
                        description: event.description,
                    },
                });
            }
        }
    }

    console.log('Seeding finished.');
};

seed()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
