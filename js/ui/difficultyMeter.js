import { el } from "../utils/dom.js";
import { t } from "../services/i18n.js";
import { MAX_DIFFICULTY } from "../features/difficulty.js";

export function createDifficultyMeter(level) {
  const name = t(`difficulty.levels.${level}`);
  const pips = Array.from({ length: MAX_DIFFICULTY }, (_, index) =>
    el("span", { class: "pip", dataset: { on: String(index < level) } })
  );

  return el(
    "div",
    {
      class: "difficulty",
      dataset: { level: String(level) },
      title: t("difficulty.hint"),
    },
    el("span", { class: "difficulty__label", text: `${t("difficulty.label")}*` }),
    el("span", {
      class: "difficulty__pips",
      role: "img",
      "aria-label": t("difficulty.aria", { level, name }),
    }, pips),
    el("span", { class: "difficulty__name", text: name })
  );
}
