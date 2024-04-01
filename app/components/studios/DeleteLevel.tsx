import { FetcherWithComponents, useFetcher } from "@remix-run/react";
import { useEffect } from "react";
import { al } from "vitest/dist/reporters-5f784f42";
import type { action } from "~/routes/studio.settings.ResourceDeleteLevel";
type DeleteLevelProps = {
  levelId: string;
  inUse: boolean;
  // levelType: 'skillLevel' | 'ageLevel'
  levelType: string;
  // formRef?: React.RefObject<HTMLFormElement>
};

export default function DeleteLevel({
  levelId,
  levelType,
  inUse,
}: DeleteLevelProps) {
  const fetcher = useFetcher<typeof action>();
  const isDeleting = fetcher.state === "submitting";

  // useEffect(() => {
  //   if (fetcher.state === "idle" && fetcher?.data?.warning) {
  //     alert(
  //       "This skill level cannot be deleted, as there are dance classes that are using it.  You can edit the skill level, or change all dance classes that useit to another skil level, and then delete it",
  //     );
  //   }
  // }, [fetcher]);

  const handleDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (inUse) {
      alert(
        "This level cannot be deleted, as there are dance classes that are using it.  You can edit the level, or change all dance classes that use it to another level, and then delete it",
      );
    }
    if (confirm("Are you sure you want to delete this level?")) {
      fetcher.submit(event.currentTarget.form, {
        method: "POST",
      });
    } else return;
  };

  return (
    <>
      <fetcher.Form
        id={`delete${levelId}`}
        method="post"
        action="../settings/ResourceDeleteLevel"
        className=""
      >
        <input type="hidden" name="levelId" value={levelId} />
        <input type="hidden" name="levelType" value={levelType} />
        <button
          disabled={isDeleting}
          form={`delete${levelId}`}
          onClick={(e) => handleDelete(e)}
          className="text-sm rounded bg-rose-500  text-white hover:bg-rose-600 focus:bg-rose-400  transition duration-150 ease-in-out px-2 py-[2px]"
        >
          Delete
        </button>
      </fetcher.Form>
    </>
  );
}
