import { Outlet, useLoaderData } from "@remix-run/react";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { prisma } from "~/db.server";
import {
  getParentNavData,
  getParentUser,
  requireParentUserId,
} from "~/models/parent.server";
import ParentHeader from "~/components/parents/ParentHeader";
import ParentNav from "~/components/parents/ParentNav";
import type { NavLink } from "types";
import { useState } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // check for userId(logged in user) and 'PARENT' type, return id and data if so, else redirect to '/'
  const parentUserId = await requireParentUserId(request);
  const parentNavData = await getParentNavData(parentUserId);
  const studios = await prisma.studio.findMany({
    where: {
      enrollments: {
        some: {
          dancer: {
            parent: {
              userId: parentUserId,
            },
          },
        },
      },
    },
    select: {
      name: true,
      userId: true,
    },
    distinct: ["userId"],
  });

  return json({ parentNavData, studios });
};

function ParentLayout() {
  const { parentNavData, studios } = useLoaderData<typeof loader>();
  const [showNav, toggleShowNav] = useState(false);

  const dancerLinks = parentNavData?.dancers
    ? parentNavData?.dancers.map((dancer) => {
        return {
          label: `${dancer.firstName}`,
          url: `dancer/${dancer.id}`,
        };
      })
    : [];

  const studioLinks = studios
    ? studios.map((studio) => {
        return {
          label: `${studio.name}`,
          url: `studio/${studio.userId}`,
        };
      })
    : [];

  const parentLinks: NavLink[] = [
    { label: "Home", url: "/parent" },
    { label: "Create a Custom Dance", url: "/parent/addCustomDance" },
    { label: "Add a Dancer", url: "/parent/addDancer" },
    { label: "Find a Studio", url: "/parent/searchStudios" },
    ...dancerLinks,
    ...studioLinks,
    // { label: 'Configuration', url: '/parent/settings' },
  ];
  return (
    <>
      <ParentHeader showNav={showNav} toggleShowNav={toggleShowNav} />
      <ParentNav
        links={parentLinks}
        showNav={showNav}
        toggleShowNav={toggleShowNav}
        parentNavData={parentNavData}
      />
      <main className="main_custom">
        <div className="flex-1 px-6">
          <Outlet />
        </div>
      </main>
    </>
  );
}
export default ParentLayout;
