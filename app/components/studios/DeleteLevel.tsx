import { FetcherWithComponents, useFetcher } from "@remix-run/react";
import { useEffect } from "react";
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

  return (
    <>
      <fetcher.Form
        id={`delete${levelId}`}
        method="post"
        action="../settings/ResourceDeleteLevel"
        className="pl-3 absolute top-1/2 -translate-y-1/2 right-4"
      >
        <input type="hidden" name="levelId" value={levelId} />
        <input type="hidden" name="levelType" value={levelType} />
        <button
          disabled={isDeleting}
          form={`delete${levelId}`}
          className="text-sm rounded bg-blue-500  text-white hover:bg-blue-600 focus:bg-blue-400  transition duration-150 ease-in-out ml-auto px-2 py-[2px] "
        >
          Delete
        </button>
      </fetcher.Form>
    </>
  );
}
