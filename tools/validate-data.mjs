import { readFileSync, existsSync } from "node:fs";

import { fileURLToPath } from "node:url";
const root = process.argv[2] ?? fileURLToPath(new URL("..", import.meta.url));
const read = (p) => JSON.parse(readFileSync(`${root}/${p}`, "utf8"));

const data = read("data/wanted.json");
const es = read("locales/es.json");
const en = read("locales/en.json");

const flat = (obj, prefix = "") =>
  Object.entries(obj).flatMap(([k, v]) =>
    typeof v === "object" && v !== null ? flat(v, `${prefix}${k}.`) : [`${prefix}${k}`]
  );

const errors = [];
const esKeys = new Set(flat(es));
const enKeys = new Set(flat(en));
for (const k of esKeys) if (!enKeys.has(k)) errors.push(`Falta en en.json: ${k}`);
for (const k of enKeys) if (!esKeys.has(k)) errors.push(`Falta en es.json: ${k}`);

const ids = new Set();
const tiers = new Set(["superboss", "boss", "unique"]);
for (const e of data.entries) {
  if (ids.has(e.id)) errors.push(`id duplicado: ${e.id}`);
  ids.add(e.id);
  if (!tiers.has(e.tier)) errors.push(`${e.id}: tier inválido ${e.tier}`);
  if (typeof e.reward !== "number" || e.reward <= 0) errors.push(`${e.id}: reward inválido`);
  if (!e.lore?.es || !e.lore?.en) errors.push(`${e.id}: falta lore es/en`);
  if (!Array.isArray(e.turnIn) || !Array.isArray(e.notes)) errors.push(`${e.id}: turnIn/notes no son arrays`);
  for (const n of e.notes) if (!esKeys.has(`notes.${n}`)) errors.push(`${e.id}: nota desconocida ${n}`);
  if (!Number.isInteger(e.difficulty) || e.difficulty < 1 || e.difficulty > 5) errors.push(`${e.id}: difficulty inválida ${e.difficulty}`);
}

// Cobertura de nombres en español
const namesEs = read("locales/names.es.json");
const namesEn = read("locales/names.en.json");
const cover = (cat, dict, vals) => vals.filter(Boolean).forEach((v) => { if (!dict[cat]?.[v]) errors.push(`names.es sin ${cat}: ${v}`); });
cover("places", namesEs, data.entries.map((e) => e.location));
cover("factions", namesEs, data.entries.flatMap((e) => [e.faction, ...e.turnIn]));
cover("races", namesEs, data.entries.map((e) => e.race));
cover("weapons", namesEs, data.entries.map((e) => e.weapon));
cover("characters", namesEs, data.entries.map((e) => e.name));
if (!namesEn.weapons?.["martial-arts"]) errors.push("names.en sin weapons.martial-arts");
// Entradas sobrantes en el diccionario (no usadas)
const used = { places: new Set(), factions: new Set(), races: new Set(), weapons: new Set(), characters: new Set() };
data.entries.forEach((e) => { used.places.add(e.location); used.factions.add(e.faction); e.turnIn.forEach((f) => used.factions.add(f)); used.races.add(e.race); used.weapons.add(e.weapon); });
for (const [cat, dict] of Object.entries(namesEs)) for (const k of Object.keys(dict)) if (!used[cat].has(k)) errors.push(`names.es.${cat} sin uso: ${k}`);
// Lore en español sin términos ingleses sueltos conocidos
for (const e of data.entries) for (const w of ["Island Lab","Throne of","Tower of","Blister Hill","Holy Nation","Anti-Slavers","Skinhouse HQ","Spring."]) if (e.lore.es.includes(w)) errors.push(`${e.id}: lore.es contiene "${w}"`);


// Claves usadas en data-i18n del HTML
const html = readFileSync(`${root}/index.html`, "utf8");
for (const m of html.matchAll(/data-i18n(?:-[a-z-]+)?="([^"]+)"/g)) {
  if (!esKeys.has(m[1])) errors.push(`index.html usa clave inexistente: ${m[1]}`);
}

// Referencias a archivos locales en el HTML
for (const m of html.matchAll(/(?:src|href)="((?!https?:|#)[^"]+)"/g)) {
  if (!existsSync(`${root}/${m[1]}`)) errors.push(`index.html referencia archivo inexistente: ${m[1]}`);
}

console.log(`Entradas: ${data.entries.length}`);
console.log(`Claves de idioma: es=${esKeys.size} en=${enKeys.size}`);
console.log(errors.length ? "ERRORES:\n" + errors.join("\n") : "OK: sin errores");
process.exit(errors.length ? 1 : 0);
