import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import type { AsyncReturnType } from "type-fest";

type StudioForSeeding = AsyncReturnType<typeof getStudios>[0];

async function getStudios(prisma: PrismaClient) {
  const studios = await prisma.studio.findMany({
    select: {
      userId: true,
      stylesOfDance: {
        select: {
          id: true,
          name: true,
        },
      },
      ageLevels: {
        select: {
          id: true,
          name: true,
        },
      },
      tights: {
        select: {
          id: true,
        },
      },
      footwear: {
        select: {
          id: true,
        },
      },
      skillLevels: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
  return studios;
}

// after retrieving studios from db, this function populates an array of dance classes that can then be used in a prisma create many mutation to create those dances for the studio
export function generateStudioDanceData(studio: StudioForSeeding) {
  let danceClasses = [];
  const ageLevels = studio.ageLevels;
  console.log("ageLevels", ageLevels);
  const tights = studio.tights;
  console.log("tights", tights);
  const footwear = studio.footwear;
  console.log("footwear", footwear);
  const skillLevels = studio.skillLevels;
  console.log("skillLevels", skillLevels);
  const stylesOfDance = studio.stylesOfDance;
  console.log("stylesOfDance in dance seed", stylesOfDance);
  const defaultSkillLevel = skillLevels.filter(
    (level) => level.name === "Recreational",
  )[0];

  for (const ageLevel of ageLevels) {
    for (const style of stylesOfDance) {
      const shouldDuplicateForSkillLevels = [
        // 'Mini',
        "Junior",
        "Teen",
        "Senior",
      ].includes(ageLevel.name);

      if (shouldDuplicateForSkillLevels) {
        for (let skillLevel of skillLevels) {
          const tightsId = tights[Math.floor(Math.random() * tights.length)].id;
          const footwearId =
            footwear[Math.floor(Math.random() * footwear.length)].id;
          // const styleOfDanceId =
          //   stylesOfDance[Math.floor(Math.random() * stylesOfDance.length)].id;
          danceClasses.push({
            name: `${ageLevel.name} ${skillLevel.name} ${style.name} `,
            ageLevelId: ageLevel.id,
            skillLevelId: skillLevel.id,
            tightsId: tightsId,
            footwearId: footwearId,
            studioId: studio.userId,
            competitions: skillLevel.name === "Company" ? true : false,
            recital: true,
            styleOfDanceId: style.id,
          });
        }
      } else {
        const tightsId = tights[Math.floor(Math.random() * tights.length)].id;
        const footwearId =
          footwear[Math.floor(Math.random() * footwear.length)].id;
        // const styleOfDanceId =
        //   stylesOfDance[Math.floor(Math.random() * stylesOfDance.length)].id;

        danceClasses.push({
          name: `${ageLevel.name} Recreational ${style}`,
          ageLevelId: ageLevel.id,
          skillLevelId: defaultSkillLevel.id,
          styleOfDanceId: style.id,
          tightsId: tightsId,
          footwearId: footwearId,
          studioId: studio.userId,
          competitions: false,
          recital: true,
        });
      }
    }
  }
  return danceClasses;
}

async function seedDanceClasses(prisma: PrismaClient) {
  console.log("seeding studio dance classes");

  const studios = await getStudios(prisma);
  if (!studios.length) {
    console.log(
      'no studios ... run "npm run seedStudios" to create studios, then seed dance classes',
    );
    return;
  }
  for (const studio of studios) {
    const danceClassData = generateStudioDanceData(studio);
    await prisma.danceClass.createMany({
      data: danceClassData,
    });
  }
  console.log(`Database has been seeded with Studio dance classes. 🌱`);
}

seedDanceClasses(prisma)
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export { seedDanceClasses };
