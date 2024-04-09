import { PrismaClient } from "@prisma/client";
import { seedStudios } from "./seedStudios";
import { seedDanceClasses } from "./seedStudioDanceClasses";
import { seedParentsAndDancers } from "./seedParents";
import { seedEnrollments } from "./seedEnrollments";
const prisma = new PrismaClient();

async function seed() {
  await seedStudios(prisma);
  await seedDanceClasses(prisma);
  await seedParentsAndDancers(prisma);
  await seedEnrollments(prisma);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
