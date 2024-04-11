import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { ContentContainer } from "~/components/styledComponents/ContentContainer";
import { getDanceClass, requireParentUserId } from "~/models/parent.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const danceClassId = params.danceClassId;
  if (!danceClassId) throw new Error("No dance class ID provided");
  const parentId = await requireParentUserId(request);
  const danceClass = await getDanceClass({ danceClassId, parentId });
  if (!danceClass) throw new Error("No dance class found");
  return danceClass;
}

export default function SelectedDanceClass() {
  const {
    name,
    performanceName,
    footwear,
    footwearId,
    tights,
    tightsId,
    dayOfWeek,
    startTime,
    endTime,
    song,
    studio,
    studioNotes,
  } = useLoaderData<typeof loader>();

  return (
    <div className="px-4">
      <ContentContainer className="p-4">
        <h2 className="pb-4 text-center text-lg font-bold">{name}</h2>
        <div className="">
          {performanceName && <p>"{performanceName}"</p>}
          <p>Footwear: {footwear?.name}</p>
          <p>Tights: {tights?.name}</p>
        </div>
      </ContentContainer>
    </div>
  );
}
