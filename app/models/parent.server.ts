import type {
  User,
  Parent,
  Studio,
  AgeLevel,
  DanceClass,
  SkillLevel,
  Tights,
  Footwear,
  StyleOfDance,
} from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";
import { getUserById } from "./user.server";
import { redirect } from "@remix-run/node";
import { T } from "vitest/dist/reporters-5f784f42";
import { Style } from "node:util";
import { AsyncReturnType } from "type-fest";

export async function requireParentUserId(request: Request) {
  // check for UserId - if none, no one is logged in, redirect to /welcome
  const userId = await requireUserId(request);

  // get User, check user type for 'PARENT'
  const user = await getUserById(userId);
  if (!user || user?.type !== "PARENT") {
    throw redirect(`/`);
  }
  return userId;
}

// return logged in parent without password
export async function getParentUser(request: Request) {
  // check for UserId on session - if none, no one is logged in, redirect to /welcome
  const userId = await requireUserId(request);

  // get User, check user type for 'STUDIO'
  const userWithPassword = await getUserById(userId);
  if (!userWithPassword || userWithPassword?.type !== "PARENT") {
    throw redirect(`/`);
  }
  const { password: _password, ...userWithoutPassword } = userWithPassword;
  return userWithoutPassword;
}

export async function createParent(
  email: User["email"],
  password: User["password"],
  type: User["type"],
  firstName: Parent["firstName"],
  lastName: Parent["lastName"],
) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      email,
      type,
      password: hashedPassword,
      parent: {
        create: {
          firstName,
          lastName,
        },
      },
    },
  });
}

export async function getParentNavData(parentId: string) {
  const parentNavData = await prisma.parent.findUnique({
    where: {
      userId: parentId,
    },
    select: {
      userId: true,
      firstName: true,
      lastName: true,
      dancers: {
        select: {
          firstName: true,
          id: true,
        },
      },
    },
  });
  return parentNavData;
}

export type ParentNavData = AsyncReturnType<typeof getParentNavData>;

export async function createParentCustomDance({
  name,
  performanceName,
  parentId,
  studioId,
  ageLevelId,
  skillLevelId,
  competitions,
  recital,
  tightsId,
  footwearId,
  styleOfDanceId,
}: {
  name: DanceClass["name"];
  performanceName?: DanceClass["performanceName"];
  parentId: Parent["userId"];
  studioId?: Studio["userId"];
  ageLevelId: AgeLevel["id"];
  skillLevelId: SkillLevel["id"];
  competitions?: DanceClass["competitions"];
  recital: DanceClass["recital"];
  tightsId?: Tights["id"];
  footwearId?: Footwear["id"];
  styleOfDanceId: StyleOfDance["id"];
}) {
  return prisma.danceClass.create({
    data: {
      name,
      performanceName,
      parentId,
      studioId, // not the owner of the dance, but the studio where the dance is performed
      ageLevelId,
      skillLevelId,
      competitions,
      recital,
      tightsId,
      footwearId,
      styleOfDanceId,
    },
  });
}

export async function getDanceClass({
  danceClassId,
  parentId,
}: {
  danceClassId: DanceClass["id"];
  parentId: Parent["userId"];
}) {
  const danceClass = prisma.danceClass.findUnique({
    where: {
      id: danceClassId,
    },
    include: {
      // name: true,
      // performanceName: true,
      studio: true,
      tights: true,
      footwear: true,
      styleOfDance: true,
      enrollments: {
        where: {
          dancer: {
            parentId: parentId,
          },
        },
      },
    },
  });
  return danceClass;
}
