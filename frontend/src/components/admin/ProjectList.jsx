import { buttonDanger, buttonGhost } from "./styles";

function techLabel(tech) {
  return typeof tech === "string" ? tech : tech.name;
}

export function ProjectCard({ project, onEdit, onDelete }) {
  const techs = project.tecnologias ?? [];

  return (
    <article className="rounded-md border border-border p-6 transition-colors duration-200 hover:border-text-muted">
      <h3 className="text-heading-md">{project.name}</h3>
      <p className="mt-2 text-body-md text-text-secondary">
        {project.description}
      </p>
      {techs.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {techs.map((tech) => (
            <li
              key={techLabel(tech)}
              className="rounded-full border border-border px-2.5 py-0.5 font-mono text-label-md uppercase text-text-muted"
            >
              {techLabel(tech)}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => onEdit(project)}
          className={`${buttonGhost} w-full sm:w-auto`}
        >
          Editar
        </button>
        <button
          type="button"
          onClick={() => onDelete(project)}
          className={`${buttonDanger} w-full sm:w-auto`}
        >
          Excluir
        </button>
      </div>
    </article>
  );
}

export function ProjectList({ projects, onEdit, onDelete }) {
  return (
    <ul className="flex flex-col gap-4">
      {projects.map((project) => (
        <li key={project.id}>
          <ProjectCard
            project={project}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </li>
      ))}
    </ul>
  );
}
