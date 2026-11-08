import { byId } from "../utils/dom.js";
import { t } from "../services/i18n.js";

const TIERS = ["superboss", "boss", "unique"];
const STATUSES = ["all", "pending", "done"];
const SORTS = ["rewardDesc", "rewardAsc", "difficultyDesc", "difficultyAsc", "name", "location"];

function fillSelect(select, options, selected) {
  select.replaceChildren(
    ...options.map(({ value, label }) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      return option;
    })
  );
  select.value = selected;
}

/** Vuelve a pintar opciones traducidas, idioma activo y botón de tema. */
export function syncControls({ filters, lang, theme }) {
  fillSelect(
    byId("filter-tier"),
    [{ value: "all", label: t("filters.tierAll") }, ...TIERS.map((v) => ({ value: v, label: t(`tiers.${v}`) }))],
    filters.tier
  );
  fillSelect(
    byId("filter-status"),
    STATUSES.map((v) => ({ value: v, label: t(`filters.statusOptions.${v}`) })),
    filters.status
  );
  fillSelect(
    byId("filter-sort"),
    SORTS.map((v) => ({ value: v, label: t(`filters.sortOptions.${v}`) })),
    filters.sort
  );

  byId("search").value = filters.query;

  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.lang === lang));
  });

  const themeButton = byId("btn-theme");
  const toLight = theme === "dark";
  themeButton.textContent = toLight ? "☀" : "☾";
  themeButton.setAttribute("aria-label", t(toLight ? "header.themeToLight" : "header.themeToDark"));
  themeButton.setAttribute("title", t(toLight ? "header.themeToLight" : "header.themeToDark"));
}

export function bindControls(handlers) {
  byId("search").addEventListener("input", (event) => handlers.onFilter({ query: event.target.value }));
  byId("filter-tier").addEventListener("change", (event) => handlers.onFilter({ tier: event.target.value }));
  byId("filter-status").addEventListener("change", (event) => handlers.onFilter({ status: event.target.value }));
  byId("filter-sort").addEventListener("change", (event) => handlers.onFilter({ sort: event.target.value }));

  byId("btn-clear-filters").addEventListener("click", handlers.onClearFilters);
  byId("empty-clear").addEventListener("click", handlers.onClearFilters);
  byId("btn-reset-progress").addEventListener("click", handlers.onResetProgress);
  byId("btn-theme").addEventListener("click", handlers.onToggleTheme);

  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.addEventListener("click", () => handlers.onLang(button.dataset.lang));
  });
}
