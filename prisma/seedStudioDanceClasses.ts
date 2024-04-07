import { DanceClass, PrismaClient } from "@prisma/client";
import { start } from "node:repl";
const prisma = new PrismaClient();
import type { AsyncReturnType } from "type-fest";

type StudioForSeeding = AsyncReturnType<typeof getStudios>[0];

async function getStudios(prisma: PrismaClient) {
  console.log("retrieving studios from db");
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
  console.log("generating studio dance data");
  let danceClasses = [];
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const compDaysOfWeek = ["Friday", "Saturday", "Sunday"];
  const hours = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
  const minutes = [
    "00",
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "20",
    "21",
    "22",
    "23",
    "24",
    "25",
    "26",
    "27",
    "28",
    "29",
    "30",
    "31",
    "32",
    "33",
    "34",
    "35",
    "36",
    "37",
    "38",
    "39",
    "40",
    "41",
    "42",
    "43",
    "44",
    "45",
    "46",
    "47",
    "48",
    "49",
    "50",
    "51",
    "52",
    "53",
    "54",
    "55",
    "56",
    "57",
    "58",
    "59",
  ];
  const ageLevels = studio.ageLevels;
  const tights = studio.tights;
  const footwear = studio.footwear;
  const skillLevels = studio.skillLevels;
  const stylesOfDance = studio.stylesOfDance;

  for (const ageLevel of ageLevels) {
    for (const style of stylesOfDance) {
      for (const skillLevel of skillLevels) {
        const tightsId = tights[Math.floor(Math.random() * tights.length)].id;
        const footwearId =
          footwear[Math.floor(Math.random() * footwear.length)].id;
        const startHour = `${hours[Math.floor(Math.random() * hours.length)]}`;
        const endHour = startHour + 1;
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
          startTime: `${startHour}:00`,
          endTime: `${endHour}:00`,
          dayOfWeek: daysOfWeek[Math.floor(Math.random() * daysOfWeek.length)],
          competitionEntryDayOfWeek:
            skillLevel.name === "Company"
              ? compDaysOfWeek[
                  Math.floor(Math.random() * compDaysOfWeek.length)
                ]
              : null,
          competitionEntryNumber:
            skillLevel.name === "Company"
              ? Math.floor(Math.random() * 500).toString()
              : null,
          competitionEntryTime:
            skillLevel.name === "Company"
              ? `${
                  hours[Math.floor(Math.random() * hours.length)]
                }:${minutes[Math.floor(Math.random() * minutes.length)]}`
              : null,
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

// seedDanceClasses(prisma)
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

export { seedDanceClasses };
