import { createCard } from "./card.js";

export function renderList(container, entries, { completed, lang, onToggle }) {
  container.replaceChildren(
    ...entries.map((entry) => createCard(entry, { done: completed.has(entry.id), lang, onToggle }))
  );
}

/** Actualiza el estado visual sin reconstruir las tarjetas (evita perder el foco). */
export function syncCards(container, completed) {
  container.querySelectorAll(".poster").forEach((card) => {
    const done = completed.has(card.dataset.id);
    card.dataset.done = String(done);
    const input = card.querySelector(".check__input");
    if (input) input.checked = done;
  });
}
