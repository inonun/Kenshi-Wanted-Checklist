const DATA_URL = new URL("../../data/wanted.json", import.meta.url);

export async function loadWanted() {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`No se pudo cargar ${DATA_URL.pathname} (HTTP ${response.status})`);
  }
  const data = await response.json();
  if (!Array.isArray(data.entries)) {
    throw new Error("data/wanted.json no tiene la lista 'entries'");
  }
  return data.entries;
}
