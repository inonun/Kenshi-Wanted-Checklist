export const DEFAULT_FILTERS = Object.freeze({
  query: "",
  tier: "all",
  status: "all",
  sort: "rewardDesc",
});

export const state = {
  /** @type {Array<object>} entradas de data/wanted.json */
  wanted: [],
  /** @type {Set<string>} ids capturados */
  completed: new Set(),
  lang: "en",
  theme: "dark",
  filters: { ...DEFAULT_FILTERS },
};
