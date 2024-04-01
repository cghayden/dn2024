import { useRef, useState } from "react";
import { UpsertLevelForm } from "~/components/studios/UpsertLevelForm";
import { LevelList } from "~/components/studios/LevelList";
import { ContentContainer } from "~/components/styledComponents/ContentContainer";
import { TableHeader } from "~/components/styledComponents/TableHeader";
import { Prisma } from "@prisma/client";
import { cn } from "~/lib/tailwindUtils";

export type AgeLevelWithDanceClasses = Prisma.AgeLevelGetPayload<{
  include: { danceClasses: { select: { id: true } } };
}>;
export type SkillLevelWithDanceClasses = Prisma.SkillLevelGetPayload<{
  include: { danceClasses: { select: { id: true } } };
}>;
export type StyleOfDanceWithDanceClasses = Prisma.StyleOfDanceGetPayload<{
  include: { danceClasses: { select: { id: true } } };
}>;

type ConfigItemListProps = {
  data:
    | AgeLevelWithDanceClasses[]
    | SkillLevelWithDanceClasses[]
    | StyleOfDanceWithDanceClasses[];
  page: "Age Levels" | "Skill Levels" | "Styles of Dance";
  itemType: "ageLevel" | "skillLevel" | "styleOfDance";
};

export default function ConfigItemList({
  data,
  page,
  itemType,
}: ConfigItemListProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [editMode, toggleEditMode] = useState(false);
  return (
    <div className="w-5/6 mx-auto mb-8">
      <TableHeader headerText={page} className="">
        <div className="text-right mb-2">
          {editMode ? (
            <button
              className="btn-noBg-cancel"
              onClick={() => toggleEditMode(!editMode)}
            >
              Close Edit Mode
            </button>
          ) : (
            <button
              className="btn-noBg-action"
              onClick={() => toggleEditMode(!editMode)}
            >
              Edit / Add
            </button>
          )}
        </div>
      </TableHeader>

      <ContentContainer
        className={cn({
          " border-rose-600": editMode === true,
          " border-transparent": editMode === false,
          "w-full": true,
          "border-2": true,
        })}
      >
        <table className="w-full">
          <thead className="block">
            <tr className="bg-gray-200 py-1 grid grid-cols-2 justify-items-start rounded-t-md">
              <th className="pl-2">Name</th>
              {<th className="pl-2">Description</th>}
            </tr>
          </thead>
          {!data.length && !editMode && (
            <p className="text-center py-8">
              You have no {page}. Click "edit/add to create
            </p>
          )}
          {/* if in edit mode, make all current levels names and desc. editable, otherwise just list them */}
          {editMode ? (
            <tbody>
              {data.map((level) => (
                <UpsertLevelForm
                  key={level.id}
                  level={level}
                  levelType={itemType}
                  inUse={level.danceClasses.length > 0}
                />
              ))}
              {/* in edit provide a blank entry at the end of the list to enter a new level name and desc. */}
              <UpsertLevelForm
                formRef={formRef}
                levelType={itemType}
                inUse={false}
              />
            </tbody>
          ) : (
            <LevelList levels={data} />
          )}
        </table>
      </ContentContainer>
    </div>
  );
}
