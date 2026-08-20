import { projects, type Project } from "@/src/data/projects";

/**
 * Item de projeto no formato da referência visual: ano em display à esquerda,
 * nome dominante logo abaixo, descrição curta na mesma coluna; stack em coluna
 * mono à direita com o link (GitHub) como fecho em destaque.
 */
function ProjectItem({ project }: { project: Project }) {
  return (
    <li>
      <div className="group grid gap-8 border-b border-border py-10 transition-transform duration-200 ease-out hover:-translate-y-0.5 md:grid-cols-12 md:gap-6 md:py-16">
        <div className="md:col-span-7">
          <p className="text-display-lg">{project.year}</p>
          <h3 className="mt-2 text-display-xl underline-offset-8 group-hover:underline">
            {project.name}
          </h3>
          <p className="mt-6 max-w-[52ch] text-body-md text-text-secondary transition-colors duration-200 group-hover:text-text-primary">
            {project.description}
          </p>
        </div>

        <div className="flex flex-col gap-2 font-mono text-label-md uppercase text-text-muted md:col-span-5 md:justify-center">
          {project.stack.map((tech) => (
            <span key={tech}>{tech}</span>
          ))}
          {project.link ? (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 w-fit text-text-primary hover:underline"
            >
              {project.linkLabel ?? "GitHub"}
            </a>
          ) : null}
        </div>
      </div>
    </li>
  );
}

/**
 * Seção intermediária — projetos como parte da composição, nunca um grid
 * genérico de cards. Cada item ocupa presença plena: ano e nome grandes à
 * esquerda, stack técnica em mono à direita.
 */
export function Projects() {
  return (
    <div>
      <h2 className="font-mono text-label-md uppercase text-text-muted">
        Projetos
      </h2>

      {projects.length > 0 ? (
        <ol className="mt-4 md:mt-8">
          {projects.map((project) => (
            <ProjectItem key={project.name} project={project} />
          ))}
        </ol>
      ) : null}
    </div>
  );
}
