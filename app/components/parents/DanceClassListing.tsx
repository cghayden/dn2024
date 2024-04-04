import { ContentContainer } from "../styledComponents/ContentContainer";
import type { ParentDanceClassListing } from "~/routes/parent._index";

export default function DanceClassListing({
  danceClass,
}: {
  danceClass: ParentDanceClassListing;
}) {
  return (
    <ContentContainer>
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
    </ContentContainer>
  );
}
