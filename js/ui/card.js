import { el } from "../utils/dom.js";
import { formatNumber } from "../utils/format.js";
import { t } from "../services/i18n.js";
import { localize } from "../features/names.js";
import { difficultyLevel } from "../features/difficulty.js";
import { createDifficultyMeter } from "./difficultyMeter.js";

const WIKI_BASE = "https://kenshi.fandom.com/wiki/";

/** Nombre en el idioma activo; si difiere, añade el original del juego en tono tenue. */
function nameNode(category, value) {
  const { text, original } = localize(category, value);
  if (!original) return text;
  return [text, " ", el("span", { class: "orig", title: t("card.originalName"), text: `(${original})` })];
}

function fact(label, content) {
  return content ? [el("dt", { text: label }), el("dd", {}, content)] : [];
}

/**
 * @param {object} entry   objeto de data/wanted.json
 * @param {{done: boolean, lang: string, onToggle: (id: string, checked: boolean) => void}} ctx
 */
export function createCard(entry, { done, lang, onToggle }) {
  const checkboxId = `done-${entry.id}`;
  const lore = entry.lore?.[lang] ?? entry.lore?.en ?? "";
  const displayName = localize("characters", entry.name).text;

  const checkbox = el("input", {
    class: "check__input",
    type: "checkbox",
    id: checkboxId,
    checked: done,
    "aria-label": t("card.markCaptured", { name: displayName }),
    onchange: (event) => onToggle(entry.id, event.target.checked),
  });

  const location = entry.location ? nameNode("places", entry.location) : t("card.noFixedHome");

  return el(
    "li",
    {
      class: "poster",
      dataset: { id: entry.id, tier: entry.tier, done: String(done) },
    },
    el("div", { class: "poster__done-stamp", "aria-hidden": "true", text: t("card.captured") }),

    el(
      "div",
      { class: "poster__head" },
      el("span", { class: "poster__wanted", text: t("card.wanted") }),
      el("span", { class: "tier", text: t(`tiers.${entry.tier}`) })
    ),

    el("h3", { class: "poster__name" }, nameNode("characters", entry.name)),

    el(
      "p",
      { class: "poster__reward" },
      el("span", { class: "poster__reward-label", text: t("card.reward") }),
      el("span", {
        class: "poster__reward-value",
        text: `≈ ${formatNumber(entry.reward, lang)} ${t("card.cats")}`,
      })
    ),

    createDifficultyMeter(difficultyLevel(entry)),

    el(
      "dl",
      { class: "poster__facts" },
      fact(t("card.location"), location),
      fact(t("card.faction"), entry.faction && nameNode("factions", entry.faction)),
      fact(t("card.race"), entry.race && nameNode("races", entry.race)),
      fact(t("card.weapon"), entry.weapon && nameNode("weapons", entry.weapon))
    ),

    entry.turnIn.length > 0 &&
      el(
        "div",
        { class: "poster__turnin" },
        el("span", { class: "poster__turnin-label", text: t("card.turnIn") }),
        el(
          "ul",
          { class: "chips" },
          entry.turnIn.map((faction) => {
            const { text, original } = localize("factions", faction);
            return el("li", { class: "chip", title: original ?? faction, text });
          })
        )
      ),

    lore && el("p", { class: "poster__lore", text: lore }),

    entry.notes.length > 0 &&
      el(
        "ul",
        { class: "poster__notes" },
        entry.notes.map((note) => el("li", { text: t(`notes.${note}`) }))
      ),

    el(
      "div",
      { class: "poster__footer" },
      el("label", { class: "check", for: checkboxId }, checkbox, el("span", { text: t("card.captured") })),
      entry.wiki &&
        el("a", {
          class: "poster__link",
          href: WIKI_BASE + entry.wiki,
          target: "_blank",
          rel: "noopener noreferrer",
          text: `${t("card.wiki")} ↗`,
        })
    )
  );
}
