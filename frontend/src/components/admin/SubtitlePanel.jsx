import { useEffect, useId, useState } from "react";
import { z } from "zod";
import {
  createSubtitle,
  getCurrentSubtitle,
  updateSubtitle,
} from "@/service/subtitleApi";
import {
  buttonGhost,
  buttonPrimary,
  errorClass,
  labelClass,
  successClass,
  textareaClass,
} from "./styles";

const subtitleSchema = z.object({
  subtitle: z
    .string()
    .trim()
    .min(1, { error: "Informe o texto do Sobre." })
    .max(2000, { error: "Use no máximo 2000 caracteres." }),
});

export function SubtitlePanel() {
  const fieldId = useId();
  const [record, setRecord] = useState(null);
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [formError, setFormError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function load({ silent = false } = {}) {
    if (!silent) {
      setIsLoading(true);
      setLoadError("");
    }
    try {
      const current = await getCurrentSubtitle();
      setRecord(current);
      setValue(current?.subtitle ?? "");
      setLoadError("");
    } catch {
      const message = "Não foi possível carregar o texto do Sobre. Tente de novo.";
      if (silent) {
        setFormError(message);
      } else {
        setLoadError(message);
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    const result = subtitleSchema.safeParse({ subtitle: value });
    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);
      setFieldError(fieldErrors.subtitle?.[0] ?? "");
      document.getElementById(fieldId)?.focus();
      return;
    }

    setFieldError("");
    setFormError("");
    setFeedback("");
    setIsSaving(true);
    try {
      const saved = record
        ? await updateSubtitle(record.id, result.data.subtitle)
        : await createSubtitle(result.data.subtitle);
      setRecord(saved);
      setValue(saved.subtitle);
      setFeedback("✓ Texto salvo.");
    } catch {
      setFormError("Não foi possível salvar o texto. Tente de novo.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section aria-labelledby="admin-sobre">
      <h2
        id="admin-sobre"
        className="font-mono text-label-md uppercase text-text-muted"
      >
        Sobre
      </h2>

      {isLoading && (
        <p
          role="status"
          className="mt-8 font-mono text-label-md uppercase text-text-muted"
        >
          Carregando texto…
        </p>
      )}

      {loadError && (
        <div className="mt-8 flex flex-col gap-4">
          <p role="alert" className={errorClass}>
            {loadError}
          </p>
          <button
            type="button"
            onClick={() => load()}
            className={`${buttonGhost} w-full sm:w-auto`}
          >
            Tentar de novo
          </button>
        </div>
      )}

      {!isLoading && !loadError && (
        <form
          className="mt-8 rounded-md border border-border p-6"
          noValidate
          onSubmit={handleSubmit}
        >
          <label htmlFor={fieldId} className={labelClass}>
            Texto
          </label>
          <textarea
            id={fieldId}
            name="subtitle"
            required
            maxLength={2000}
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setFieldError("");
              setFeedback("");
            }}
            aria-invalid={Boolean(fieldError)}
            aria-describedby={fieldError ? `${fieldId}-error` : undefined}
            className={textareaClass}
          />
          {fieldError && (
            <p
              id={`${fieldId}-error`}
              role="alert"
              className={`${errorClass} mt-2`}
            >
              {fieldError}
            </p>
          )}
          {formError && (
            <p role="alert" className={`${errorClass} mt-4`}>
              {formError}
            </p>
          )}
          {feedback && (
            <p role="status" className={`${successClass} mt-4`}>
              {feedback}
            </p>
          )}
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className={`${buttonPrimary} w-full sm:w-auto`}
            >
              {isSaving ? "Salvando..." : "Salvar texto"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
