import { state, DEFAULT_FILTERS } from "./state.js";
import { byId } from "./utils/dom.js";
import { storage } from "./services/storage.js";
import { loadWanted } from "./services/dataService.js";
import { detectLang, setLang, getLang, t } from "./services/i18n.js";
import { applyTheme, nextTheme, resolveInitialTheme } from "./features/theme.js";
import { applyFilters } from "./features/filters.js";
import { computeProgress } from "./features/progress.js";
import { renderList, syncCards } from "./ui/list.js";
import { updateProgressPanel } from "./ui/progressPanel.js";
import { bindControls, syncControls } from "./ui/controls.js";

/* ---------- Progreso ---------- */

function loadCompleted() {
  const saved = storage.get("completed", []);
  const validIds = new Set(state.wanted.map((entry) => entry.id));
  const ids = Array.isArray(saved) ? saved.filter((id) => validIds.has(id)) : [];
  state.completed = new Set(ids);
}

function saveCompleted() {
  storage.set("completed", [...state.completed]);
}

/* ---------- Renderizado ---------- */

function renderPanel() {
  updateProgressPanel(computeProgress(state.wanted, state.completed), state.lang);
}

function renderAll() {
  const entries = applyFilters(state.wanted, state.filters, state.completed, state.lang);

  renderList(byId("wanted-list"), entries, {
    completed: state.completed,
    lang: state.lang,
    onToggle: toggleEntry,
  });

  byId("empty-state").hidden = entries.length > 0;
  byId("results-count").textContent = t("filters.results", {
    shown: entries.length,
    total: state.wanted.length,
  });
  renderPanel();
}

/* ---------- Acciones ---------- */

function toggleEntry(id, checked) {
  if (checked) state.completed.add(id);
  else state.completed.delete(id);
  saveCompleted();

  renderPanel();
  // Con un filtro de estado activo la tarjeta puede dejar de coincidir.
  if (state.filters.status === "all") syncCards(byId("wanted-list"), state.completed);
  else renderAll();
}

function updateFilters(changes) {
  Object.assign(state.filters, changes);
  renderAll();
}

function clearFilters() {
  state.filters = { ...DEFAULT_FILTERS };
  syncControls(state);
  renderAll();
}

function resetProgress() {
  if (!window.confirm(t("progress.resetConfirm"))) return;
  state.completed.clear();
  saveCompleted();
  renderAll();
}

async function changeLang(lang) {
  if (lang === getLang()) return;
  await setLang(lang);
  state.lang = getLang();
  syncControls(state);
  renderAll();
}

function toggleTheme() {
  state.theme = nextTheme(state.theme);
  applyTheme(state.theme);
  syncControls(state);
}

/* ---------- Inicio ---------- */

function showLoadError(error) {
  console.error(error);
  byId("load-error").hidden = false;
  byId("app-content").hidden = true;
}

async function init() {
  state.theme = resolveInitialTheme();
  applyTheme(state.theme);

  try {
    await setLang(detectLang());
    state.lang = getLang();
    state.wanted = await loadWanted();
  } catch (error) {
    showLoadError(error);
    return;
  }

  loadCompleted();

  bindControls({
    onFilter: updateFilters,
    onClearFilters: clearFilters,
    onResetProgress: resetProgress,
    onToggleTheme: toggleTheme,
    onLang: changeLang,
  });

  // Mantiene sincronizadas varias pestañas abiertas.
  window.addEventListener("storage", (event) => {
    if (event.key !== "kw.completed") return;
    loadCompleted();
    renderAll();
  });

  syncControls(state);
  renderAll();
}

init();
