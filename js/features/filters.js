import { normalize } from "../utils/format.js";
import { localize } from "./names.js";
import { difficultyLevel } from "./difficulty.js";

const byName = (a, b) => localize("characters", a.name).text.localeCompare(localize("characters", b.name).text);

function locationLabel(entry) {
  return entry.location ? localize("places", entry.location).text : "";
}

const SORTERS = {
  rewardDesc: (a, b) => b.reward - a.reward || byName(a, b),
  rewardAsc: (a, b) => a.reward - b.reward || byName(a, b),
  difficultyDesc: (a, b) => difficultyLevel(b) - difficultyLevel(a) || b.reward - a.reward || byName(a, b),
  difficultyAsc: (a, b) => difficultyLevel(a) - difficultyLevel(b) || a.reward - b.reward || byName(a, b),
  name: byName,
  // Ordena por el nombre del lugar en el idioma activo; sin ubicación fija va al final.
  location: (a, b, lang) => {
    const la = locationLabel(a);
    const lb = locationLabel(b);
    if (!la && !lb) return byName(a, b);
    if (!la) return 1;
    if (!lb) return -1;
    return la.localeCompare(lb, lang) || byName(a, b);
  },
};

/** Texto buscable: nombre original y traducido de lugar, facción, raza y arma. */
function searchText(entry, lang) {
  const parts = [entry.name, localize("characters", entry.name).text, entry.lore?.[lang]];
  const fields = [
    ["places", entry.location],
    ["factions", entry.faction],
    ["races", entry.race],
    ["weapons", entry.weapon],
    ...entry.turnIn.map((faction) => ["factions", faction]),
  ];

  for (const [category, value] of fields) {
    if (!value) continue;
    const { text, original } = localize(category, value);
    parts.push(text, original ?? value);
  }
  return normalize(parts.join(" "));
}

export function applyFilters(entries, filters, completed, lang) {
  const query = normalize(filters.query);
  const sorter = SORTERS[filters.sort] ?? SORTERS.rewardDesc;

  return entries
    .filter((entry) => {
      if (filters.tier !== "all" && entry.tier !== filters.tier) return false;
      if (filters.status === "done" && !completed.has(entry.id)) return false;
      if (filters.status === "pending" && completed.has(entry.id)) return false;
      return !query || searchText(entry, lang).includes(query);
    })
    .sort((a, b) => sorter(a, b, lang));
}

export function hasActiveFilters(filters, defaults) {
  return Object.keys(defaults).some((key) => filters[key] !== defaults[key]);
}
