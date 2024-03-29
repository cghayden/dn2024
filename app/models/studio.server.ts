import type {
  User,
  Studio,
  AgeLevel,
  DanceClass,
  SkillLevel,
  Footwear,
  Tights,
  Dancer,
  StyleOfDance,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";
import { getUserById } from "./user.server";
import { redirect } from "@remix-run/node";
import type { DeleteItem } from "types";
// import { select } from 'node_modules/@conform-to/react/helpers'

// return logged in studio without password
export async function requireStudio(request: Request) {
  // check for UserId on session - if none, no one is logged in, redirect to /welcome
  const userId = await requireUserId(request);

  // get User, check user type for 'STUDIO'
  const userWithPassword = await getUserById(userId);
  if (!userWithPassword || userWithPassword?.type !== "STUDIO") {
    throw redirect(`/`);
  }
  const { password: _password, ...userWithoutPassword } = userWithPassword;
  return userWithoutPassword;
}

// return logged in Studio UserId
export async function requireStudioUserId(request: Request) {
  const studio = await requireStudio(request);
  return studio.userId;
}

export async function createStudio(
  email: User["email"],
  password: User["password"],
  type: User["type"],
  name: Studio["name"],
) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      type,
      studio: {
        create: {
          name,
        },
      },
    },
  });
}

export async function getFullStudio(userId: User["userId"]) {
  const studio = prisma.studio.findUnique({
    where: {
      userId,
    },
    include: {
      danceClasses: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
  return studio;
}

export async function parentSearchStudios({
  searchVal,
}: {
  searchVal: string;
}) {
  const studios = await prisma.studio.findMany({
    where: {
      name: {
        contains: searchVal,
        mode: "insensitive",
      },
    },
  });
  return studios;
}

export async function getDanceClasses_Name_Id(userId: User["userId"]) {
  const studio = prisma.danceClass.findMany({
    where: {
      studioId: userId,
    },
    select: {
      name: true,
      id: true,
      skillLevel: true,
      ageLevel: {
        select: {
          name: true,
        },
      },
      styleOfDance: {
        select: {
          name: true,
          id: true,
        },
      },
    },
    orderBy: {
      ageLevel: {
        name: "asc",
      },
    },
  });
  return studio;
}

export async function getAgeLevels(userId: User["userId"]) {
  const studio = prisma.ageLevel.findMany({
    where: {
      studioId: userId,
    },
    orderBy: {
      name: "asc",
    },
  });
  return studio;
}

export async function getSkillLevels(userId: User["userId"]) {
  const studio = prisma.skillLevel.findMany({
    where: {
      studioId: userId,
    },
    orderBy: {
      name: "asc",
    },
  });
  return studio;
}

export async function getStudioFootwear(userId: User["userId"]) {
  const footwear = await prisma.footwear.findMany({
    where: {
      studioId: userId,
    },
    orderBy: {
      name: "asc",
    },
  });
  return footwear;
}
export async function getStudioTights(userId: User["userId"]) {
  const tights = await prisma.tights.findMany({
    where: {
      studioId: userId,
    },
    orderBy: {
      name: "asc",
    },
  });
  return tights;
}

export async function getFootwearItem(footwearId: Footwear["id"]) {
  const footwearItem = await prisma.footwear.findUnique({
    where: {
      id: footwearId,
    },
  });

  return footwearItem;
}

export async function getTightsItem(tightsId: Tights["id"]) {
  const tightsItem = await prisma.tights.findUnique({
    where: {
      id: tightsId,
    },
  });

  return tightsItem;
}

export async function getStudioConfig(userId: User["userId"]) {
  const studio = prisma.studio.findUnique({
    where: {
      userId,
    },
    select: {
      ageLevels: {
        select: {
          id: true,
          name: true,
          description: true,
          studioId: true,
          danceClasses: {
            select: {
              id: true,
            },
          },
        },
      },
      skillLevels: {
        select: {
          id: true,
          name: true,
          description: true,
          studioId: true,
          danceClasses: {
            select: {
              id: true,
            },
          },
        },
      },

      stylesOfDance: {
        select: {
          id: true,
          name: true,
          studioId: true,
          description: true,
          danceClasses: {
            select: {
              id: true,
            },
          },
        },
      },
      tights: true,
      footwear: true,
    },
  });
  return studio;
}

export async function getDanceClass({
  danceId,
}: {
  danceId: DanceClass["id"];
}) {
  const danceClass = await prisma.danceClass.findUnique({
    where: { id: danceId },
    select: {
      id: true,
      studioId: true,
      name: true,
      performanceName: true,
      tightsId: true,
      footwearId: true,
      skillLevelId: true,
      ageLevelId: true,
      competitions: true,
      recital: true,
      styleOfDance: true,
      enrollments: {
        distinct: "dancerId",
        select: {
          id: true,
          dancer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      ageLevel: {
        select: {
          name: true,
          id: true,
        },
      },
      skillLevel: {
        select: {
          name: true,
          id: true,
        },
      },
      tights: {
        select: {
          name: true,
          id: true,
          url: true,
        },
      },
      footwear: {
        select: {
          name: true,
          id: true,
          url: true,
        },
      },
      instructor: {
        select: {
          userId: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return danceClass;
}

export async function getStudioDancesToBrowse({
  studioId,
}: {
  studioId: Studio["userId"];
}) {
  const studioDances = await prisma.studio.findUnique({
    where: {
      userId: studioId,
    },
    select: {
      name: true,
      danceClasses: {
        select: {
          id: true,
          styleOfDance: true,
          name: true,
          ageLevel: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });
  return studioDances;
}

export async function getStudioDancers(studioId: Studio["userId"]) {
  return await prisma.dancer.findMany({
    where: {
      enrollments: {
        some: {
          studioId: studioId,
        },
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      parent: {
        select: {
          firstName: true,
        },
      },
      enrollments: {
        where: {
          studioId: studioId,
        },
        select: { studioId: true, class: { select: { name: true } } },
      },
    },
  });
}

// MUTATIONS //

export async function updateAgeLevel(
  levelId: AgeLevel["id"],
  newName: AgeLevel["name"],
  levelDescription: AgeLevel["description"],
) {
  await prisma.ageLevel.update({
    where: {
      id: levelId,
    },
    data: {
      name: newName,
      description: levelDescription,
    },
  });
}

export async function upsertStudioFootwear({
  studioId,
  footwearId,
  name,
  description,
  url,
  imageFilename,
  danceClassIds,
}: {
  studioId: User["userId"];
  footwearId: Footwear["id"] | "new";
  name: Footwear["name"];
  description?: Footwear["description"];
  url?: Footwear["url"];
  imageFilename?: Footwear["imageFilename"];
  danceClassIds: string[];
}) {
  const danceClassConnector = danceClassIds.map((classId) => {
    return { id: classId };
  });
  return await prisma.footwear.upsert({
    where: {
      id: footwearId,
    },
    update: {
      name,
      description,
      studioId,
      url,
      imageFilename,
      danceClasses: {
        connect: danceClassConnector,
      },
    },
    create: {
      name,
      description,
      studioId,
      url,
      imageFilename,
      danceClasses: {
        connect: danceClassConnector,
      },
    },
  });
}

export async function saveFootwearImage({
  footwearId,
  imageFilename,
}: {
  footwearId: Footwear["id"];
  imageFilename: Footwear["imageFilename"];
}) {
  await prisma.footwear.update({
    where: {
      id: footwearId,
    },
    data: {
      imageFilename,
    },
  });
}

export async function upsertStudioTights({
  studioId,
  tightsId,
  name,
  description,
  url,
  imageFilename,
  danceClassIds,
}: {
  studioId: User["userId"];
  tightsId: Tights["id"] | "new";
  name: Tights["name"];
  description?: Tights["description"];
  url?: Tights["url"];
  imageFilename?: Tights["imageFilename"];
  danceClassIds: string[];
}) {
  const danceClassConnector = danceClassIds.map((classId) => {
    return { id: classId };
  });
  return await prisma.tights.upsert({
    where: {
      id: tightsId,
    },
    update: {
      name,
      description,
      studioId,
      url,
      imageFilename,
      danceClasses: {
        connect: danceClassConnector,
      },
    },
    create: {
      name,
      description,
      studioId,
      url,
      imageFilename,
      danceClasses: {
        connect: danceClassConnector,
      },
    },
  });
}

export async function upsertSkillLevel(
  userId: Studio["userId"],
  levelId: SkillLevel["id"] | "new",
  newName: SkillLevel["name"],
  levelDescription: SkillLevel["description"] = null,
) {
  await prisma.skillLevel.upsert({
    where: {
      id: levelId,
    },
    update: {
      name: newName,
      description: levelDescription,
    },
    create: {
      name: newName,
      description: levelDescription,
      studio: {
        connect: {
          userId,
        },
      },
    },
  });
}
export async function upsertAgeLevel(
  userId: Studio["userId"],
  levelId: AgeLevel["id"] | "new",
  newName: AgeLevel["name"],
  levelDescription: AgeLevel["description"] = null,
) {
  await prisma.ageLevel.upsert({
    where: {
      id: levelId,
    },
    update: {
      name: newName,
      description: levelDescription,
    },
    create: {
      name: newName,
      description: levelDescription,
      studio: {
        connect: {
          userId,
        },
      },
    },
  });
}
export async function upsertStyleOfDance(
  userId: Studio["userId"],
  levelId: StyleOfDance["id"] | "new",
  newName: StyleOfDance["name"],
  levelDescription: StyleOfDance["description"] = null,
) {
  await prisma.skillLevel.upsert({
    where: {
      id: levelId,
    },
    update: {
      name: newName,
      description: levelDescription,
    },
    create: {
      name: newName,
      description: levelDescription,
      studio: {
        connect: {
          userId,
        },
      },
    },
  });
}

export async function createStudioDance({
  name,
  performanceName,
  competitions,
  recital,
  studioId,
  ageLevelId,
  skillLevelId,
  tightsId = null,
  footwearId = null,
  styleOfDance,
}: {
  name: DanceClass["name"];
  performanceName: DanceClass["performanceName"];
  competitions: DanceClass["competitions"];
  recital: DanceClass["recital"];
  studioId: DanceClass["studioId"];
  ageLevelId: DanceClass["ageLevelId"];
  skillLevelId: DanceClass["skillLevelId"];
  tightsId?: DanceClass["tightsId"] | null;
  footwearId?: DanceClass["footwearId"] | null;
  styleOfDance: string;
}) {
  await prisma.danceClass.create({
    data: {
      name,
      performanceName,
      studioId,
      ageLevelId,
      competitions,
      recital,
      skillLevelId,
      tightsId,
      footwearId,
      styleOfDance,
    },
  });
}

export async function updateStudioDance({
  danceClassId,
  name,
  performanceName,
  competitions,
  recital,
  studioId,
  ageLevelId,
  skillLevelId,
  tightsId = null,
  footwearId = null,
  styleOfDance,
}: {
  danceClassId: DanceClass["id"];
  name: DanceClass["name"];
  performanceName: DanceClass["performanceName"];
  competitions: DanceClass["competitions"];
  recital: DanceClass["recital"];
  studioId: DanceClass["studioId"];
  ageLevelId: DanceClass["ageLevelId"];
  skillLevelId: DanceClass["skillLevelId"];
  tightsId?: DanceClass["tightsId"] | null;
  footwearId?: DanceClass["footwearId"] | null;
  styleOfDance: string;
}) {
  await prisma.danceClass.update({
    where: {
      id: danceClassId,
    },
    data: {
      name,
      performanceName,
      studioId,
      ageLevelId,
      competitions,
      recital,
      skillLevelId,
      tightsId,
      footwearId,
      styleOfDance,
    },
  });
}

export async function deleteItem({ itemId, itemType }: DeleteItem) {
  switch (itemType) {
    case "tights":
      await prisma.tights.delete({
        where: { id: itemId },
      });
      break;

    case "footwear":
      await prisma.footwear.delete({
        where: { id: itemId },
      });
      break;

    default:
      throw new Error("id or item type not provided");
  }
}

export async function enrollDancerInDanceClass({
  dancerId,
  danceClassId,
  studioId,
}: {
  dancerId: Dancer["id"];
  danceClassId: DanceClass["id"];
  studioId: Studio["userId"];
}) {
  return await prisma.enrollment.create({
    data: {
      dancerId,
      classId: danceClassId,
      studioId: studioId,
    },
  });
}
