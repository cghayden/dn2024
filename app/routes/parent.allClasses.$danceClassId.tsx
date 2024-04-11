import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
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
  const navigate = useNavigate();
  return (
    <div className="modalOnSmallScreen px-4">
      <button
        className="closeModal  mb-4 mt-4 rounded bg-blue-500 px-4 py-2 text-white"
        onClick={() => navigate(-1)}
      >
        Back
      </button>
      <ContentContainer className="modalContainer p-4">
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
