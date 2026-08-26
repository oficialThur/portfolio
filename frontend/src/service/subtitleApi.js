import api from "./api";

export function currentSubtitle(list = []) {
  return list[0] ?? null;
}

export async function listSubtitles() {
  const { data } = await api.get("/subtitulos");
  return data;
}

export async function getCurrentSubtitle() {
  const list = await listSubtitles();
  return currentSubtitle(list);
}

export async function createSubtitle(subtitle) {
  const { data } = await api.post("/subtitulos", { subtitle });
  return data;
}

export async function updateSubtitle(id, subtitle) {
  const { data } = await api.put(`/subtitulos/${id}`, { subtitle });
  return data;
}
