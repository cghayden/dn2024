import { Link } from "@remix-run/react";
import { ContentContainer } from "../styledComponents/ContentContainer";
import type { ParentDanceClassListing } from "~/routes/parent._index";

export default function DanceClassListing({
  danceClass,
}: {
  danceClass: ParentDanceClassListing;
}) {
  return (
    <ContentContainer className="max-w-[600px]">
      <Link to={`/parent/allClasses/${danceClass.id}`}>
        <div className="flex flex-col">
          <h2 className="text-xl font-bold text-center">{danceClass.name}</h2>
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
    </ContentContainer>
  );
}