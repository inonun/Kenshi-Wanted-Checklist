const LOCALES = { es: "es-ES", en: "en-US" };

/** Formatea un número con el separador de miles del idioma activo. */
export function formatNumber(value, lang) {
  return new Intl.NumberFormat(LOCALES[lang] ?? lang).format(value);
}

/** Normaliza texto para búsquedas: minúsculas y sin tildes. */
export function normalize(text) {
  return String(text ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}
