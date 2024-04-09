import { useState } from "react";
import { SingleDanceLink } from "./SingleDanceLink";
import { type DanceListingType } from "~/routes/studio.danceClasses";

export default function DancesPageDanceListings({
  danceClasses,
}: {
  danceClasses: DanceListingType[] | null;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const filteredDances = danceClasses?.filter((danceClass) =>
    danceClass.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  return (
    <div>
      <h2 className="py-2 text-center text-xl">Dance Classes</h2>

      <div className="w-full bg-slate-100 p-4 ">
        <input
          type="text"
          className="w-full rounded border border-gray-200 p-2"
          placeholder="Search ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <ul className="p-4">
        {filteredDances?.map((danceClass) => (
          <li key={danceClass.id}>
            <SingleDanceLink danceClass={danceClass} />
          </li>
        ))}
      </ul>
    </div>
  );
}
