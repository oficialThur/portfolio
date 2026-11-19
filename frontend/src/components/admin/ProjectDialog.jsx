import { useEffect, useRef } from "react";
import { buttonDanger, buttonGhost, dialogClass } from "./styles";

function dismissIfBackdrop(event, onClose) {
  const dialog = event.currentTarget;
  const rect = dialog.getBoundingClientRect();
  const outside =
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom;
  if (outside) onClose();
}

function useModal(open) {
  const ref = useRef(null);
  const ignoreClose = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    if (open) {
      if (!node.open) node.showModal();
    } else if (node.open) {
      ignoreClose.current = true;
      node.close();
    }

    return () => {
      if (node.open) {
        ignoreClose.current = true;
        node.close();
      }
    };
  }, [open]);

  function handleNativeClose(onClose) {
    if (ignoreClose.current) {
      ignoreClose.current = false;
      return;
    }
    onClose();
  }

  return { ref, handleNativeClose };
}

export function ProjectDialog({ open, title, onClose, children }) {
  const { ref, handleNativeClose } = useModal(open);

  return (
    <dialog
      ref={ref}
      aria-labelledby="project-dialog-title"
      onClose={() => handleNativeClose(onClose)}
      onClick={(event) => dismissIfBackdrop(event, onClose)}
      className={dialogClass}
    >
      <h2 id="project-dialog-title" className="text-heading-md">
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </dialog>
  );
}

export function ConfirmDeleteDialog({
  open,
  projectName,
  isDeleting,
  error,
  onCancel,
  onConfirm,
}) {
  const { ref, handleNativeClose } = useModal(open);

  return (
    <dialog
      ref={ref}
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-copy"
      onClose={() => handleNativeClose(onCancel)}
      onClick={(event) => dismissIfBackdrop(event, onCancel)}
      className={dialogClass}
    >
      <h2 id="delete-dialog-title" className="text-heading-md">
        Excluir projeto?
      </h2>
      <p
        id="delete-dialog-copy"
        className="mt-4 text-body-md text-text-secondary"
      >
        {projectName
          ? `“${projectName}” será removido. Essa ação não pode ser desfeita.`
          : "Essa ação não pode ser desfeita."}
      </p>
      {error && (
        <p role="alert" className="mt-4 font-mono text-label-md text-danger">
          {error}
        </p>
      )}
      <div className="mt-8 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className={`${buttonGhost} w-full sm:w-auto`}
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={isDeleting}
          onClick={onConfirm}
          className={`${buttonDanger} w-full sm:w-auto`}
        >
          {isDeleting ? "Excluindo..." : "Excluir"}
        </button>
      </div>
    </dialog>
  );
}
