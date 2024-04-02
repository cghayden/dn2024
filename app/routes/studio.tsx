import { Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import StudioHeader from "~/components/studios/StudioHeader";
import { ErrorContainer } from "~/components/styledComponents/ErrorContainer";
import StudioNav from "~/components/studios/StudioNav";
import type { NavLink } from "types";
import { useState } from "react";
import { requireStudio } from "~/models/studio.server";
import type { LoaderFunctionArgs } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const studioUser = await requireStudio(request);

  return studioUser;
};

export default function StudioLayout() {
  const studioUser = useLoaderData<typeof loader>();
  const [showNav, toggleShowNav] = useState(false);

  const studioLinks: NavLink[] = [
    { label: "Home", url: "/studio" },
    { label: "Dancers", url: "/studio/dancers" },
    { label: "Dance Classes", url: "/studio/danceClasses" },
    { label: "Create a New Dance", url: "/studio/addDanceClass" },
    { label: "Footwear", url: "footwear" },
    { label: "Tights", url: "tights" },
    { label: "Configuration", url: "config" },
  ];
  return (
    <>
      <StudioHeader showNav={showNav} toggleShowNav={toggleShowNav} />
      <StudioNav
        links={studioLinks}
        showNav={showNav}
        toggleShowNav={toggleShowNav}
        user={studioUser}
      />
      <main className="main_custom">
        <div className="flex-1">
          <Outlet />
        </div>
      </main>
    </>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  return <ErrorContainer error={error} />;
}
