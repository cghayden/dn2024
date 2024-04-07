import type { Filters } from "~/routes/studio.danceClasses";

export default function ActiveFilterDisplay({ filters }: { filters: Filters }) {
  console.log("active view filters", Object.values(filters));
  return (
    <ul className="flex text-sm">
      {Object.values(filters).map((filter) => {
        if (filter === false) return;
        if (filter === true) {
          return (
            <li
              key={"compValue"}
              className="m-2 rounded-xl bg-amber-700 px-2 py-1 text-amber-50"
            >
              Competition View
            </li>
          );
        }
        return filter.map((label) => (
          <li
            key={label}
            className="m-2 rounded-xl bg-amber-700 px-2 py-1 text-amber-50"
          >
            {label}
          </li>
        ));
      })}
    </ul>
  );
}
