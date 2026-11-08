import { storage } from "./storage.js";

export const SUPPORTED_LANGS = ["es", "en"];
const DEFAULT_LANG = "en";

let dictionary = {};
let names = {};
let currentLang = DEFAULT_LANG;

/** Diccionario de nombres propios del idioma activo: { places, factions, races, weapons }. */
export function getNames() {
  return names;
}

export function detectLang() {
  const saved = storage.get("lang");
  if (SUPPORTED_LANGS.includes(saved)) return saved;

  const browser = (navigator.language || "").slice(0, 2).toLowerCase();
  return SUPPORTED_LANGS.includes(browser) ? browser : DEFAULT_LANG;
}

export function getLang() {
  return currentLang;
}

export async function setLang(lang) {
  const target = SUPPORTED_LANGS.includes(lang) ? lang : DEFAULT_LANG;
  const url = new URL(`../../locales/${target}.json`, import.meta.url);

  const namesUrl = new URL(`../../locales/names.${target}.json`, import.meta.url);

  // Textos de interfaz y nombres propios (lugares, facciones, razas, armas) en paralelo.
  const [response, namesResponse] = await Promise.all([fetch(url), fetch(namesUrl)]);
  if (!response.ok) throw new Error(`No se pudo cargar el idioma "${target}"`);

  dictionary = await response.json();
  names = namesResponse.ok ? await namesResponse.json() : {};
  currentLang = target;
  storage.set("lang", target);

  document.documentElement.lang = target;
  document.title = t("app.documentTitle");
  translateStatic();
}

function resolve(key) {
  return key.split(".").reduce((node, part) => (node == null ? undefined : node[part]), dictionary);
}

export function has(key) {
  return typeof resolve(key) === "string";
}

/** Devuelve el texto de la clave; reemplaza {parametros}. Si falta, devuelve la clave. */
export function t(key, params = {}) {
  const value = resolve(key);
  if (typeof value !== "string") return key;
  return value.replace(/\{(\w+)\}/g, (match, name) => (name in params ? params[name] : match));
}

export function translateStatic(root = document) {
  const map = [
    ["data-i18n", (node, text) => (node.textContent = text)],
    ["data-i18n-placeholder", (node, text) => node.setAttribute("placeholder", text)],
    ["data-i18n-aria-label", (node, text) => node.setAttribute("aria-label", text)],
    ["data-i18n-title", (node, text) => node.setAttribute("title", text)],
  ];

  for (const [attribute, apply] of map) {
    root.querySelectorAll(`[${attribute}]`).forEach((node) => {
      apply(node, t(node.getAttribute(attribute)));
    });
  }
}
