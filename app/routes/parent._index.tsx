import { redirect, type LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import DanceClassListing from "~/components/parents/DanceClassListing";
import { PageHeader } from "~/components/styledComponents/PageHeader";
import { prisma } from "~/db.server";
import { requireParentUserId } from "~/models/parent.server";
import { DanceClass, Parent, Studio } from "@prisma/client";

export type ParentDanceClassListing = DanceClass & {
  dancerNames: string[];
  studio: Pick<Studio, "name" | "userId"> | null;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // check for userId(logged in user) and 'PARENT' type, return id if so
  const userId = await requireParentUserId(request);
  const dancers = await prisma.dancer.findMany({
    where: {
      parentId: userId,
    },
  });

  // Extract the dancer IDs
  const dancerIds = dancers.map((dancer) => dancer.id);

  // Now, get all enrollments where the dancerId is in the list of dancer IDs
  const enrollments = await prisma.enrollment.findMany({
    where: {
      dancerId: {
        in: dancerIds,
      },
    },
    include: {
      danceClass: {
        include: {
          studio: {
            select: {
              name: true,
              userId: true,
            },
          },
        },
      },
      dancer: {
        select: {
          firstName: true,
        },
      },
    },
  });

  // Create a map where the keys are dance class IDs and the values are arrays of dancer names
  const danceClassesMap: {
    [key: string]: ParentDanceClassListing;
  } = {};

  enrollments.forEach((enrollment) => {
    const danceClassId = enrollment.danceClass.id;
    const dancerName = enrollment.dancer.firstName;

    if (danceClassesMap[danceClassId]) {
      // If the dance class is already in the map, add the dancer name to the array
      danceClassesMap[danceClassId].dancerNames.push(dancerName);
    } else {
      // If the dance class is not in the map, add it with the dancer name
      danceClassesMap[danceClassId] = {
        ...enrollment.danceClass,
        dancerNames: [dancerName],
      };
    }
  });

  // Convert the map to an array
  const danceClasses = Object.values(danceClassesMap);

  const parent = await prisma.parent.findUnique({
    where: {
      userId: userId,
    },
    include: {
      dancers: true,
    },
  });
  if (!parent) {
    return redirect("/");
  }

  if (!parent.dancers || parent.dancers.length === 0) {
    return redirect("addDancer");
  }
  return json({ parent, danceClasses, enrollments });
};

export default function ParentIndex() {
  const { parent, danceClasses, enrollments } = useLoaderData<typeof loader>();
  if (!parent.dancers.length) {
    return (
      <div>
        <h1>Parent Index</h1>
        <p>you have no dancers</p>
      </div>
    );
  }
  return (
    <div>
      <PageHeader headerText="All Dance Classes" />
      {danceClasses.map((danceClass) => (
        <DanceClassListing key={danceClass?.id} danceClass={danceClass} />
      ))}
    </div>
  );
}
