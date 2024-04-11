import { Link } from "@remix-run/react";
import type { ParentDanceClassListing } from "~/routes/parent._index";

export default function DanceClassListing({
  danceClass,
  active,
}: {
  danceClass: ParentDanceClassListing;
  active?: boolean;
}) {
  return (
    <div
      className={`max-w-[600px] border-b-2 border-slate-500 ${active ? "bg-indigo-300" : "bg-white"}`}
    >
      <Link to={`/parent/allClasses/${danceClass.id}`}>
        <div className="flex flex-col">
          <h2 className="text-center text-lg font-bold">{danceClass.name}</h2>
          <div className="text-center">{danceClass.studio?.name}</div>
          <div>
            <ul>
              {danceClass.dancerNames.map((dancerName) => (
                <li key={dancerName}>{dancerName}</li>
              ))}
            </ul>
          </div>
        </div>
      </Link>
    </div>
  );
}
