import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const chapters = [
    {
        position: 1,
        title: "Python Fundamentals",
        lessons: [
            "1. Python Introduction",
            "2. Variables and Data Types",
            "3. Conditions and Loops",
            "4. Functions",
        ],
    },
    {
        position: 2,
        title: "NumPy",
        lessons: [
            "1. NumPy Arrays",
            "2. Array Operations",
            "3. Indexing and Slicing",
            "4. Mathematical Operations",
        ],
    },
    {
        position: 3,
        title: "Pandas",
        lessons: [
            "1. Series and DataFrames",
            "2. Reading Datasets",
            "3. Data Cleaning",
            "4. Filtering and Grouping",
        ],
    },
    {
        position: 4,
        title: "Data Visualization",
        lessons: [
            "1. Matplotlib Basics",
            "2. Line Charts",
            "3. Bar Charts",
            "4. Exploratory Data Analysis",
        ],
    },
];

async function main() {
    console.log("🌱 Seeding Python for Data Science...");

    const course = await prisma.course.findUnique({
        where: {
            slug: "python-for-data-science",
        },
    });

    if (!course) {
        throw new Error(
            'Course "Python for Data Science" not found. Create the course first.'
        );
    }

    for (const chapterData of chapters) {
        const existingChapter = await prisma.chapter.findFirst({
            where: {
                courseId: course.id,
                position: chapterData.position,
            },
        });

        if (existingChapter) {
            console.log(
                `⏭️ Chapter ${chapterData.position} already exists: ${existingChapter.title}`
            );
            continue;
        }

        const chapter = await prisma.chapter.create({
            data: {
                title: chapterData.title,
                position: chapterData.position,
                courseId: course.id,
                lessons: {
                    create: chapterData.lessons.map((title, index) => ({
                        title,
                        description: `<p>Learn about <strong>${title}</strong> in this lesson.</p>`,
                        position: index + 1,
                    })),
                },
            },
            include: {
                lessons: true,
            },
        });

        console.log(
            `✅ Created Chapter ${chapter.position}: ${chapter.title} (${chapter.lessons.length} lessons)`
        );
    }

    console.log("🎉 Python for Data Science seeding completed!");
}

main()
    .catch((error) => {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });