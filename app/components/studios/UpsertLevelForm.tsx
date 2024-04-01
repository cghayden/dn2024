import { type AgeLevel, type SkillLevel } from "@prisma/client";
import { useFetcher } from "@remix-run/react";
import { TextInput } from "../forms/TextInput";
import { useEffect, useState } from "react";
import { useForm } from "@conform-to/react";
import { type action } from "../../routes/studio.settings.ResourceEditLevels";
import DeleteLevel from "./DeleteLevel";
import {
  AgeLevelWithDanceClasses,
  SkillLevelWithDanceClasses,
  StyleOfDanceWithDanceClasses,
} from "./ConfigItemList";

type LevelEditableListProps = {
  level?:
    | AgeLevelWithDanceClasses
    | SkillLevelWithDanceClasses
    | StyleOfDanceWithDanceClasses;
  levelType: "skillLevel" | "ageLevel" | "styleOfDance";
  inUse: boolean;
  formRef?: React.RefObject<HTMLFormElement>;
};

export function UpsertLevelForm({
  level,
  levelType,
  formRef,
  inUse,
}: LevelEditableListProps) {
  const fetcher = useFetcher<typeof action>();
  const lastSubmission = fetcher?.data;
  let success = fetcher?.data;
  let isSaving = fetcher.state === "submitting";
  let fetcherState = fetcher.state;
  const [showSaveButton, toggleShowSaveButton] = useState(false);

  useEffect(() => {
    if (fetcherState === "idle" && success) {
      toggleShowSaveButton(false);
      formRef?.current?.reset();
    }
  }, [success, fetcherState, formRef]);

  const [form] = useForm({
    lastSubmission,
  });

  return (
    <tr>
      <td className="grid" style={{ gridTemplateColumns: "1fr 70px" }}>
        <fetcher.Form
          {...form.props}
          id={level?.id ?? `new${levelType}`}
          method="post"
          action="../settings/ResourceEditLevels"
          ref={formRef}
          className="py-1"
        >
          <input name={"levelId"} value={level?.id ?? "new"} type="hidden" />
          <input name={"levelType"} value={levelType} type="hidden" />
          <div className=" levels_edit grid grid-cols-2 gap-1">
            <TextInput
              label={""}
              name="newLevelName"
              defaultValue={level?.name ?? ""}
              onChange={() => toggleShowSaveButton(true)}
              error={
                lastSubmission?.error?.newLevelName
                  ? lastSubmission?.error?.newLevelName[0]
                  : undefined
              }
            />
            <TextInput
              label={""}
              name="levelDescription"
              defaultValue={level?.description ?? ""}
              onChange={() => toggleShowSaveButton(true)}
              error={
                lastSubmission?.error?.levelDescription
                  ? lastSubmission?.error?.levelDescription[0]
                  : undefined
              }
            />
          </div>
        </fetcher.Form>
        <div className="buttonContainer flex justify-center items-center">
          {showSaveButton ? (
            <button
              type="submit"
              disabled={isSaving}
              form={level?.id ?? `new${levelType}`}
              className="text-sm rounded bg-blue-500  text-white hover:bg-blue-600 focus:bg-blue-400  transition duration-150 ease-in-out px-2 py-[2px]"
            >
              Save
            </button>
          ) : level ? (
            <DeleteLevel
              levelType={levelType}
              levelId={level.id}
              inUse={inUse}
            />
          ) : null}
        </div>
      </td>
    </tr>
  );
}
