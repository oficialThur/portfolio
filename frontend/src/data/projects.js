/**
 * Estrutura do projeto (DESIGN.md › Project + referência visual
 * "Captura de tela de 2026-08-16 12-42-17.png"):
 * ano em display · nome dominante · descrição curta · stack em coluna mono ·
 * link opcional (ex.: GitHub).
 */

/** Capacidade da seção (DESIGN.md › Full Structure: Project A · B · C). */
export const MAX_PROJECTS = 3;

// PLACEHOLDERS para visualização da estrutura — substituir pelos projetos
// reais (nome, descrição, stack, ano, link). A seção exibe no máximo 3
// projetos (DESIGN.md › Full Structure: Project A · B · C); cada um ocupa
// um plano no palco espacial. Itens além do terceiro são ignorados.
export const projects = [
  {
    name: "Primeiro projeto",
    description:
      "Descrição breve do que o projeto faz e do problema que ele resolve. Substitua pelos dados reais em src/data/projects.js.",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL"],
    link: "https://github.com/seu-usuario/nome-do-projeto",
    linkLabel: "GitHub",
  },
  {
    name: "Segundo projeto",
    description:
      "Descrição breve do segundo projeto — placeholder para validar a lista com mais de um item. Substitua pelos dados reais.",
    stack: ["React", "Node.js", "Express", "MariaDB"],
    link: "https://github.com/seu-usuario/segundo-projeto",
    linkLabel: "GitHub",
  },
  {
    name: "Terceiro projeto",
    description:
      "Descrição breve do terceiro projeto — placeholder que preenche a capacidade máxima da seção. Substitua pelos dados reais.",
    stack: ["Vite", "JavaScript", "Prisma"],
    link: "https://github.com/seu-usuario/terceiro-projeto",
    linkLabel: "GitHub",
  },
];

export function visibleProjects(source = projects) {
  return source.slice(0, MAX_PROJECTS);
}
