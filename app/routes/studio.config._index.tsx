import { type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getStudioConfig, requireStudioUserId } from "~/models/studio.server";
import ConfigItemList from "../components/studios/ConfigItemList";
import StringArrayTable from "../components/studios/StringArrayTable";
import type { AgeLevel, SkillLevel } from "@prisma/client";

// type LoaderData = {
//   ageLevels: AgeLevel[];
//   skillLevels: SkillLevel[];
//   stylesOfDance: KeyedStyleOfDance[];
// };

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireStudioUserId(request);
  const config = await getStudioConfig(userId);
  if (!config) throw new Error("error loading config values");

  // const data: LoaderData = {
  //   ageLevels: config.ageLevels,
  //   skillLevels: config.skillLevels,
  //   stylesOfDance: keyedStylesOfDance,
  // };

  return config;
};

export default function StudioConfigIndex() {
  const { ageLevels, skillLevels, stylesOfDance } =
    useLoaderData<typeof loader>();
  return (
    <>
      <ConfigItemList itemType="ageLevel" page="Age Levels" data={ageLevels} />
      <ConfigItemList
        itemType="skillLevel"
        page="Skill Levels"
        data={skillLevels}
      />
      {/* <ConfigItemList
        itemType="styleOfDance"
        page="Styles of Dance"
        data={stylesOfDance}
      /> */}
    </>
  );
}
