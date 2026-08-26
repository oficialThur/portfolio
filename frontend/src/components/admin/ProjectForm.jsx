import { useEffect, useId, useState } from "react";
import { z } from "zod";
import { TechToggle } from "./TechToggle.jsx";
import {
  buttonGhost,
  buttonPrimary,
  errorClass,
  inputClass,
  labelClass,
  textareaClass,
} from "./styles";

const STARTER_TECHS = [
  "Next.js",
  "React",
  "Node.js",
  "TypeScript",
  "JavaScript",
  "C#",
  "PHP",
  "MySQL",
  "PostgreSQL",
  "Docker",
  "Prisma",
  "Figma",
];

const projectSchema = z.object({
  nome: z.string().trim().min(1, { error: "Informe o nome." }),
  descricao: z.string().trim().min(1, { error: "Informe a descrição." }),
  link: z.url({ error: "Informe um link válido." }),
  tecnologias: z
    .array(z.string())
    .min(1, { error: "Selecione ao menos uma tecnologia." }),
});

function techNames(project) {
  return (
    project?.tecnologias?.map((tech) =>
      typeof tech === "string" ? tech : tech.name,
    ) ?? []
  );
}

export function ProjectForm({
  project,
  knownTechs = [],
  isSubmitting,
  formError,
  onSubmit,
  onCancel,
}) {
  const nameId = useId();
  const descriptionId = useId();
  const linkId = useId();
  const techId = useId();
  const extraId = useId();

  const [values, setValues] = useState({
    nome: "",
    descricao: "",
    link: "",
    tecnologias: [],
  });
  const [extraTechs, setExtraTechs] = useState([]);
  const [newTech, setNewTech] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    setValues({
      nome: project?.name ?? "",
      descricao: project?.description ?? "",
      link: project?.link ?? "",
      tecnologias: techNames(project),
    });
    setExtraTechs([]);
    setNewTech("");
    setFieldErrors({});
  }, [project]);

  const options = Array.from(
    new Set([
      ...STARTER_TECHS,
      ...knownTechs,
      ...techNames(project),
      ...extraTechs,
    ]),
  ).sort((a, b) => a.localeCompare(b, "pt"));

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
  }

  function addTech(event) {
    event.preventDefault();
    const name = newTech.trim();
    if (!name) return;
    setExtraTechs((current) =>
      current.includes(name) ? current : [...current, name],
    );
    setValues((current) => ({
      ...current,
      tecnologias: current.tecnologias.includes(name)
        ? current.tecnologias
        : [...current.tecnologias, name],
    }));
    setNewTech("");
    setFieldErrors((current) => ({ ...current, tecnologias: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const result = projectSchema.safeParse(values);
    if (!result.success) {
      const { fieldErrors: next } = z.flattenError(result.error);
      setFieldErrors({
        nome: next.nome?.[0],
        descricao: next.descricao?.[0],
        link: next.link?.[0],
        tecnologias: next.tecnologias?.[0],
      });
      return;
    }

    setFieldErrors({});
    await onSubmit(result.data);
  }

  return (
    <form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit}>
      <div>
        <label htmlFor={nameId} className={labelClass}>
          Nome
        </label>
        <input
          id={nameId}
          name="nome"
          type="text"
          required
          autoComplete="off"
          value={values.nome}
          onChange={handleChange}
          aria-invalid={Boolean(fieldErrors.nome)}
          aria-describedby={fieldErrors.nome ? `${nameId}-error` : undefined}
          className={inputClass}
        />
        {fieldErrors.nome && (
          <p id={`${nameId}-error`} role="alert" className={`${errorClass} mt-2`}>
            {fieldErrors.nome}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={descriptionId} className={labelClass}>
          Descrição
        </label>
        <textarea
          id={descriptionId}
          name="descricao"
          required
          value={values.descricao}
          onChange={handleChange}
          aria-invalid={Boolean(fieldErrors.descricao)}
          aria-describedby={
            fieldErrors.descricao ? `${descriptionId}-error` : undefined
          }
          className={textareaClass}
        />
        {fieldErrors.descricao && (
          <p
            id={`${descriptionId}-error`}
            role="alert"
            className={`${errorClass} mt-2`}
          >
            {fieldErrors.descricao}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={linkId} className={labelClass}>
          Link
        </label>
        <input
          id={linkId}
          name="link"
          type="url"
          required
          placeholder="https://"
          value={values.link}
          onChange={handleChange}
          aria-invalid={Boolean(fieldErrors.link)}
          aria-describedby={fieldErrors.link ? `${linkId}-error` : undefined}
          className={inputClass}
        />
        {fieldErrors.link && (
          <p id={`${linkId}-error`} role="alert" className={`${errorClass} mt-2`}>
            {fieldErrors.link}
          </p>
        )}
      </div>

      <fieldset
        aria-describedby={
          fieldErrors.tecnologias ? `${techId}-error` : undefined
        }
      >
        <legend id={techId} className={labelClass}>
          Tecnologias
        </legend>
        <TechToggle
          options={options}
          selected={values.tecnologias}
          onChange={(tecnologias) => {
            setValues((current) => ({ ...current, tecnologias }));
            setFieldErrors((current) => ({
              ...current,
              tecnologias: undefined,
            }));
          }}
        />
        {fieldErrors.tecnologias && (
          <p
            id={`${techId}-error`}
            role="alert"
            className={`${errorClass} mt-2`}
          >
            {fieldErrors.tecnologias}
          </p>
        )}
        <div className="mt-4">
          <label htmlFor={extraId} className={labelClass}>
            Nova tecnologia
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id={extraId}
              type="text"
              value={newTech}
              onChange={(event) => setNewTech(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") addTech(event);
              }}
              className={inputClass}
            />
            <button
              type="button"
              onClick={addTech}
              className={`${buttonGhost} w-full sm:w-auto`}
            >
              Adicionar
            </button>
          </div>
        </div>
      </fieldset>

      {formError && (
        <p role="alert" className={errorClass}>
          {formError}
        </p>
      )}

      <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className={`${buttonGhost} w-full sm:w-auto`}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`${buttonPrimary} w-full sm:w-auto`}
        >
          {isSubmitting ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}
