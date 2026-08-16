/**
 * Estrutura do projeto (DESIGN.md › Project + referência visual
 * "Captura de tela de 2026-08-16 12-42-17.png"):
 * ano em display · nome dominante · descrição curta · stack em coluna mono ·
 * link opcional (ex.: GitHub).
 */
export type Project = {
  name: string;
  description: string;
  stack: string[];
  year: number;
  status?: string;
  link?: string;
  /** Rótulo do link (padrão: "GitHub"). */
  linkLabel?: string;
};

// PLACEHOLDER para visualização da estrutura — substituir pelos projetos
// reais (nome, descrição, stack, ano, link). Remover este item ao preencher.
export const projects: Project[] = [
  {
    name: "Nome do projeto",
    description:
      "Descrição breve do que o projeto faz e do problema que ele resolve. Substitua pelos dados reais em src/data/projects.ts.",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL"],
    year: 2025,
    link: "https://github.com/seu-usuario/nome-do-projeto",
    linkLabel: "GitHub",
  },
];
