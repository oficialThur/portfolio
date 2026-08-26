import api from "./api";

/** Capacidade da seção pública (DESIGN.md › Full Structure: Project A · B · C). */
export const MAX_PROJECTS = 3;

export function toPublicProject(project) {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    stack: (project.tecnologias ?? []).map((tech) =>
      typeof tech === "string" ? tech : tech.name,
    ),
    link: project.link,
    linkLabel: "GitHub",
  };
}

export function visibleProjects(source = []) {
  return source.slice(0, MAX_PROJECTS).map(toPublicProject);
}

export async function listProjects() {
  const { data } = await api.get("/projetos");
  return data;
}

export async function createProject(payload) {
  const { data } = await api.post("/projetos", payload);
  return data;
}

export async function updateProject(id, payload) {
  const { data } = await api.put(`/projetos/${id}`, payload);
  return data;
}

export async function deleteProject(id) {
  await api.delete(`/projetos/${id}`);
}
