import type { DanceClass } from "@prisma/client";
import { Link } from "@remix-run/react";

type DanceListingProps = Partial<DanceClass>;

export function DanceListing({
  danceClass,
}: {
  danceClass: DanceListingProps;
}) {
  if (!danceClass.id) {
    return null;
  }

  return (
    <Link
      to={`/studio/danceClass/${danceClass.id}`}
      className="inline-block py-2"
    >
      <div className="flex">
        <p className="w-[4ch]">{danceClass.competitionEntryNumber}</p>

        <p>{danceClass.name}</p>
      </div>
    </Link>
  );
}
