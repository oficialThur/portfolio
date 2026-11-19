import { useCallback, useEffect, useState } from "react";
import { useNoIndex } from "@/hooks/useNoIndex";
import {
  MAX_PROJECTS,
  createProject,
  deleteProject,
  listProjects,
  updateProject,
} from "@/service/projectsApi";
import { AdminHeader } from "@/components/admin/AdminHeader.jsx";
import {
  ConfirmDeleteDialog,
  ProjectDialog,
} from "@/components/admin/ProjectDialog.jsx";
import { ProjectForm } from "@/components/admin/ProjectForm.jsx";
import { ProjectList } from "@/components/admin/ProjectList.jsx";
import { SubtitlePanel } from "@/components/admin/SubtitlePanel.jsx";
import {
  buttonGhost,
  buttonPrimary,
  errorClass,
  successClass,
} from "@/components/admin/styles";

const directionContract = `<!--
  DIRECTION CONTRACT — /admin
  THESIS: Painel operacional para manter o texto do Sobre e os projetos —
  lista, dialog, feedback. Recusa o palco espacial e qualquer dashboard
  de métricas.
  OWN-WORLD: Canvas onyx, Inter + JetBrains Mono, borda hairline, raio 8px,
  botão primário branco; sem sombra, grain ou blur.
  STORY: Arthur autentica, edita o parágrafo do Sobre no mesmo painel,
  vê os projetos, cria/edita num dialog, confirma exclusão, recebe
  sucesso ou erro visível.
  FIRST VIEWPORT: Header ADMIN + Sair; bloco Sobre (textarea + Salvar);
  abaixo, Projetos à esquerda e Novo projeto à direita.
  FORM: Mundo pinned por docs/design/DESIGN.md › Admin Area (Operate).
  FINISH: unreviewed and undocumented is unfinished; this build ends with the
  finish review, the verdict, and DESIGN.md (pinned — já existente, não reescrito).
-->`;

export function AdminPage() {
  useNoIndex("Admin — Arthur Henrique");

  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [feedback, setFeedback] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleting, setDeleting] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const loadProjects = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setIsLoading(true);
      setListError("");
    }
    try {
      const data = await listProjects();
      setProjects(data);
      setListError("");
    } catch {
      const message = "Não foi possível carregar os projetos. Tente de novo.";
      if (silent) {
        setFeedback({ type: "error", message });
      } else {
        setListError(message);
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const knownTechs = Array.from(
    new Set(
      projects.flatMap((project) =>
        (project.tecnologias ?? []).map((tech) =>
          typeof tech === "string" ? tech : tech.name,
        ),
      ),
    ),
  );

  function openCreate() {
    setEditing(null);
    setFormError("");
    setFormOpen(true);
  }

  function openEdit(project) {
    setEditing(project);
    setFormError("");
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    setFormError("");
  }

  async function handleSave(payload) {
    setIsSaving(true);
    setFormError("");
    try {
      if (editing) {
        await updateProject(editing.id, payload);
      } else {
        await createProject(payload);
      }
      setFeedback({ type: "success", message: "✓ Projeto salvo." });
      closeForm();
      await loadProjects({ silent: true });
    } catch {
      setFormError("Não foi possível salvar o projeto. Tente de novo.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      await deleteProject(deleting.id);
      setFeedback({ type: "success", message: "✓ Projeto excluído." });
      setDeleting(null);
      await loadProjects({ silent: true });
    } catch {
      setDeleteError("Não foi possível excluir o projeto. Tente de novo.");
    } finally {
      setIsDeleting(false);
    }
  }

  const isEmpty = !isLoading && !listError && projects.length === 0;

  return (
    <div className="min-h-dvh">
      <div hidden dangerouslySetInnerHTML={{ __html: directionContract }} />
      <AdminHeader />

      <main
        id="conteudo"
        tabIndex={-1}
        className="mx-auto max-w-[1200px] px-6 py-12 md:px-8 md:py-16"
      >
        <SubtitlePanel />

        <section className="mt-16" aria-labelledby="admin-projetos">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="admin-projetos" className="font-mono text-label-md uppercase text-text-muted">
            Projetos
          </h2>
          {!isLoading && !isEmpty && (
            <button
              type="button"
              onClick={openCreate}
              className={`${buttonPrimary} w-full sm:w-auto`}
            >
              + Novo projeto
            </button>
          )}
        </div>

        {projects.length >= MAX_PROJECTS && (
          <p className="mt-4 font-mono text-label-md text-text-muted">
            O portfólio público mostra só os {MAX_PROJECTS} mais recentes.
          </p>
        )}

        {feedback && (
          <p
            role={feedback.type === "error" ? "alert" : "status"}
            className={`mt-4 ${
              feedback.type === "success" ? successClass : errorClass
            }`}
          >
            {feedback.message}
          </p>
        )}

        {isLoading && (
          <p
            role="status"
            className="mt-10 font-mono text-label-md uppercase text-text-muted"
          >
            Carregando projetos…
          </p>
        )}

        {listError && (
          <div className="mt-10 flex flex-col gap-4">
            <p role="alert" className={errorClass}>
              {listError}
            </p>
            <button
              type="button"
              onClick={() => loadProjects()}
              className={`${buttonGhost} w-full sm:w-auto`}
            >
              Tentar de novo
            </button>
          </div>
        )}

        {isEmpty && (
          <div className="mt-16 flex flex-col items-start gap-6">
            <p className="text-body-lg text-text-secondary">
              Nenhum projeto ainda.
            </p>
            <button type="button" onClick={openCreate} className={buttonPrimary}>
              + Novo projeto
            </button>
          </div>
        )}

        {!isLoading && !listError && projects.length > 0 && (
          <div className="mt-8">
            <ProjectList
              projects={projects}
              onEdit={openEdit}
              onDelete={(project) => {
                setDeleteError("");
                setDeleting(project);
              }}
            />
          </div>
        )}
        </section>
      </main>

      <ProjectDialog
        open={formOpen}
        title={editing ? "Editar projeto" : "Novo projeto"}
        onClose={closeForm}
      >
        {formOpen ? (
          <ProjectForm
            key={editing?.id ?? "new"}
            project={editing}
            knownTechs={knownTechs}
            isSubmitting={isSaving}
            formError={formError}
            onSubmit={handleSave}
            onCancel={closeForm}
          />
        ) : null}
      </ProjectDialog>

      <ConfirmDeleteDialog
        open={Boolean(deleting)}
        projectName={deleting?.name}
        isDeleting={isDeleting}
        error={deleteError}
        onCancel={() => {
          setDeleting(null);
          setDeleteError("");
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}
