import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
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
  const danceClass = useLoaderData<typeof loader>();
  console.log("danceClass", danceClass);
  return (
    <ContentContainer>
      <h1>Selected Dance Class</h1>
      <p>{danceClass.name}</p>
    </ContentContainer>
  );
}
