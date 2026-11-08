import { getNames } from "../services/i18n.js";

// Valores internos tipo "martial-arts" no son nombres del juego: no se muestran como original.
const isSlug = (value) => /^[a-z]+(-[a-z]+)*$/.test(value);

/**
 * @param {"places"|"factions"|"races"|"weapons"|"characters"} category
 * @param {string|null} value  nombre original en inglés
 * @returns {{text: string, original: string|null}}
 */
export function localize(category, value) {
  if (!value) return { text: "", original: null };

  const text = getNames()[category]?.[value] ?? value;
  const showOriginal = text !== value && !isSlug(value);
  return { text, original: showOriginal ? value : null };
}
