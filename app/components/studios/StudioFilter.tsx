import type { Filters } from "~/routes/studio.danceClasses";

type FilterCategories = {
  ageLevels: { id: string; name: string }[];
  tights: { id: string; name: string }[];
  stylesOfDance: { id: string; name: string }[];
  skillLevels: { id: string; name: string }[];
};

export default function StudioFilter({
  categories,
  filters,
  setFilters,
}: {
  categories: FilterCategories;
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}) {
  const handleFilterChange = (
    category: keyof Filters,
    name: string,
    isChecked: boolean,
  ) => {
    let newFilterValues;

    if (category === "competitionView") {
      // If the category is 'competitionView', set the filter value to isChecked directly
      newFilterValues = isChecked;
    } else {
      newFilterValues = isChecked
        ? [...filters[category], name] // Add id
        : filters[category].filter((value) => value !== name); // Remove id
    }

    setFilters((prevFilters) => ({
      ...prevFilters,
      [category]: newFilterValues,
    }));
  };

  return (
    <>
      <h3 className="py-4 text-center text-lg font-bold">Filters</h3>
      <div>
        <label>
          <input
            name="CompetitionView"
            type="checkbox"
            value="CompetitionView"
            checked={filters.competitionView}
            onChange={(e) =>
              handleFilterChange("competitionView", "", e.target.checked)
            }
          />
          Competition View
        </label>
      </div>
      <div>
        <div className="filterCategoryWrapper">
          <legend>Skill Levels</legend>
          <ul>
            {categories.skillLevels.map((skillLevel) => (
              <li key={skillLevel.id}>
                <label>
                  <input
                    name={skillLevel.name}
                    type="checkbox"
                    value={skillLevel.name}
                    checked={filters.skillLevels?.includes(skillLevel.name)}
                    onChange={(e) =>
                      handleFilterChange(
                        "skillLevels",
                        skillLevel.name,
                        e.target.checked,
                      )
                    }
                  />
                  {skillLevel.name}
                </label>
              </li>
            ))}
          </ul>
        </div>
        <div className="filterCategoryWrapper">
          <legend className="pb-4 pl-4">Age Levels</legend>
          <ul>
            {categories.ageLevels.map((ageLevel) => (
              <li key={ageLevel.id}>
                <label>
                  <input
                    name={ageLevel.name}
                    type="checkbox"
                    value={ageLevel.name}
                    checked={filters.ageLevel?.includes(ageLevel.name)}
                    onChange={(e) =>
                      handleFilterChange(
                        "ageLevel",
                        ageLevel.name,
                        e.target.checked,
                      )
                    }
                  />
                  {ageLevel.name}
                </label>
              </li>
            ))}
          </ul>
        </div>
        <div className="filterCategoryWrapper">
          <legend className="pb-4 pl-4">Style</legend>
          <ul>
            {categories.stylesOfDance.map((style) => (
              <li key={style.id}>
                <label>
                  <input
                    name={style.name}
                    type="checkbox"
                    value={style.name}
                    checked={filters.stylesOfDance?.includes(style.name)}
                    onChange={(e) =>
                      handleFilterChange(
                        "stylesOfDance",
                        style.name,
                        e.target.checked,
                      )
                    }
                  />
                  {style.name}
                </label>
              </li>
            ))}
          </ul>
        </div>
        <div className="filterCategoryWrapper">
          <legend className="pb-4 pl-4">Tights</legend>
          <ul>
            {categories.tights.map((tightsItem) => (
              <li key={tightsItem.id}>
                <label>
                  <input
                    name={tightsItem.name}
                    type="checkbox"
                    value={tightsItem.name}
                    checked={filters.tights?.includes(tightsItem.name)}
                    onChange={(e) =>
                      handleFilterChange(
                        "tights",
                        tightsItem.name,
                        e.target.checked,
                      )
                    }
                  />
                  {tightsItem.name}
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
