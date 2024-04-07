import { useEffect, useState } from "react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getSkillLevels, requireStudioUserId } from "~/models/studio.server";
import { prisma } from "~/db.server";
import StudioFilter from "~/components/studios/StudioFilter";
import DancesPageDanceListings from "~/components/studios/DancesPageDanceListings";
import ActiveFilterDisplay from "~/components/ActiveFilterDisplay";

export type Filters = {
  ageLevel: string[];
  tights: string[];
  stylesOfDance: string[];
  skillLevels: string[];
};

export type DanceListingType = {
  name: string;
  id: string;
  tights: {
    name: string;
  } | null;
  ageLevel: {
    name: string;
  };
  styleOfDance: { name: string };
  skillLevel: { name: string };
};

export type LoaderType = {
  dances: DanceListingType[];
  filterData: {
    tights: {
      id: string;
      name: string;
    }[];
    ageLevels: {
      id: string;
      name: string;
    }[];
    stylesOfDance: {
      id: string;
      name: string;
    }[];
    skillLevels: {
      id: string;
      name: string;
    }[];
  };
};

export async function loader({ request }: LoaderFunctionArgs) {
  const studioId = await requireStudioUserId(request);
  const dances = await prisma.danceClass.findMany({
    where: {
      studioId,
    },
    select: {
      id: true,
      name: true,
      competitionEntryNumber: true,
      competitions: true,
      ageLevel: {
        select: {
          name: true,
        },
      },
      styleOfDance: {
        select: {
          name: true,
        },
      },
      tights: {
        select: {
          name: true,
        },
      },
      skillLevel: {
        select: {
          name: true,
        },
      },
    },
  });

  const filterData = await prisma.studio.findUnique({
    where: {
      userId: studioId,
    },
    select: {
      ageLevels: {
        select: {
          id: true,
          name: true,
        },
      },
      tights: {
        select: {
          id: true,
          name: true,
        },
      },
      stylesOfDance: {
        select: {
          id: true,
          name: true,
        },
      },
      skillLevels: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const data = { dances, filterData };
  return data;
}

export default function DanceClasses() {
  const { dances, filterData } = useLoaderData<typeof loader>();

  const [filters, setFilters] = useState<Filters>({
    ageLevel: [],
    tights: [],
    stylesOfDance: [],
    skillLevels: [],
  });

  const [filteredDances, setFilteredDances] = useState<
    DanceListingType[] | null
  >();

  useEffect(() => {
    const applyFilters = () => {
      let result = dances.filter(
        (dance) =>
          (filters.ageLevel.length === 0 ||
            filters.ageLevel.includes(dance.ageLevel.name)) &&
          (filters.tights.length === 0 ||
            (dance.tights?.name &&
              filters.tights.includes(dance.tights.name))) &&
          (filters.stylesOfDance.length === 0 ||
            (dance.styleOfDance?.name &&
              filters.stylesOfDance.includes(dance.styleOfDance.name))) &&
          (filters.skillLevels.length === 0 ||
            filters.skillLevels.includes(dance.skillLevel.name)),
      );
      setFilteredDances(result);
    };

    applyFilters();
  }, [filters, dances]);

  return (
    <div className="flex h-[100vh]">
      <div className="flex-1">
        <ActiveFilterDisplay filters={filters} />
        <DancesPageDanceListings
          danceClasses={filteredDances ? filteredDances : dances}
        />
      </div>
      <div className="h-full w-[200px] bg-slate-300">
        {filterData && (
          <StudioFilter
            categories={filterData}
            filters={filters}
            setFilters={setFilters}
          />
        )}
      </div>
    </div>
  );
}
