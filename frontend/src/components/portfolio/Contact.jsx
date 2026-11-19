import { useState } from "react";
import { z } from "zod";
import { contact } from "@/data/site.js";
import api from "@/service/api";

const SOCIALS = [
  { label: "GitHub", href: contact.github, external: true },
  { label: "LinkedIn", href: contact.linkedin, external: true },
  {
    label: "Email",
    href: contact.email ? `mailto:${contact.email}` : "",
    external: false,
  },
];

const contactSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, { error: "Informe seu nome." })
    .max(120, { error: "Use no máximo 120 caracteres." }),
  email: z
    .string()
    .trim()
    .pipe(
      z.email({ error: "Informe um email válido." }).max(254, {
        error: "Email muito longo.",
      }),
    ),
  sobre: z
    .string()
    .trim()
    .min(1, { error: "Informe o assunto." })
    .max(200, { error: "Use no máximo 200 caracteres." }),
  mensagem: z
    .string()
    .trim()
    .min(1, { error: "Escreva uma mensagem." })
    .max(5000, { error: "Use no máximo 5000 caracteres." }),
});

const inputClass =
  "h-11 w-full rounded-sm border border-control bg-transparent px-3 text-body-md text-text-primary placeholder:text-text-muted";

const labelClass =
  "mb-2 block font-mono text-label-md uppercase text-text-muted";

const errorClass = "mt-2 font-mono text-label-md text-danger";
const successClass = "font-mono text-label-md text-success";

function FieldError({ id, message }) {
  if (!message) return null;

  return (
    <p id={id} className={errorClass}>
      {message}
    </p>
  );
}

export function Contact() {
  const [status, setStatus] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function clearFieldError(event) {
    const { name } = event.target;
    setFieldErrors((current) =>
      current[name] ? { ...current, [name]: undefined } : current,
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus(null);

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const result = contactSchema.safeParse(data);

    if (!result.success) {
      const { fieldErrors: errors } = z.flattenError(result.error);
      setFieldErrors(errors);

      // Leva o foco ao primeiro campo inválido; o aria-describedby anuncia o erro.
      const firstInvalid = Object.keys(errors)[0];
      form.elements.namedItem(firstInvalid)?.focus();
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);
    try {
      // Envia o FormData cru para o honeypot (`website`) continuar funcionando.
      await api.post("/enviando-email", data);
      setStatus({ type: "success", message: "Mensagem enviada com sucesso." });
      form.reset();
    } catch (error) {
      const statusCode = error.response?.status;
      const message =
        statusCode === 429
          ? "Muitas mensagens. Tente novamente mais tarde."
          : statusCode === 400 && error.response?.data?.msg
            ? error.response.data.msg
            : "Não foi possível enviar. Tente novamente.";

      setStatus({ type: "error", message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <h2 className="font-mono text-label-md uppercase text-text-muted">
        Contato
      </h2>

      <div className="mt-8 grid gap-12 md:mt-12 md:grid-cols-12 md:gap-6">
        <form
          className="md:col-span-7"
          noValidate
          aria-busy={isSubmitting}
          onInput={clearFieldError}
          onSubmit={handleSubmit}
        >
          {/* Honeypot: invisível para humanos, atrai bots de spam. */}
          <div aria-hidden="true" className="absolute -left-[9999px]">
            <label htmlFor="contato-website">Website</label>
            <input
              id="contato-website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>
          <div className="flex flex-col gap-6">
            <div>
              <label htmlFor="contato-nome" className={labelClass}>
                Nome
              </label>
              <input
                id="contato-nome"
                name="nome"
                type="text"
                autoComplete="name"
                maxLength={120}
                required
                aria-invalid={Boolean(fieldErrors.nome)}
                aria-describedby={fieldErrors.nome ? "contato-nome-error" : undefined}
                className={inputClass}
              />
              <FieldError
                id="contato-nome-error"
                message={fieldErrors.nome?.[0]}
              />
            </div>
            <div>
              <label htmlFor="contato-email" className={labelClass}>
                Email
              </label>
              <input
                id="contato-email"
                name="email"
                type="email"
                autoComplete="email"
                maxLength={254}
                required
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={
                  fieldErrors.email ? "contato-email-error" : undefined
                }
                className={inputClass}
              />
              <FieldError
                id="contato-email-error"
                message={fieldErrors.email?.[0]}
              />
            </div>
            <div>
              <label htmlFor="contato-sobre" className={labelClass}>
                Sobre
              </label>
              <input
                id="contato-sobre"
                name="sobre"
                type="text"
                maxLength={200}
                required
                aria-invalid={Boolean(fieldErrors.sobre)}
                aria-describedby={
                  fieldErrors.sobre ? "contato-sobre-error" : undefined
                }
                className={inputClass}
              />
              <FieldError
                id="contato-sobre-error"
                message={fieldErrors.sobre?.[0]}
              />
            </div>
            <div>
              <label htmlFor="contato-mensagem" className={labelClass}>
                Mensagem
              </label>
              <textarea
                id="contato-mensagem"
                name="mensagem"
                maxLength={5000}
                required
                aria-invalid={Boolean(fieldErrors.mensagem)}
                aria-describedby={
                  fieldErrors.mensagem ? "contato-mensagem-error" : undefined
                }
                className={`${inputClass} h-auto min-h-[132px] resize-y py-3`}
              />
              <FieldError
                id="contato-mensagem-error"
                message={fieldErrors.mensagem?.[0]}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-11 w-fit cursor-pointer rounded-sm bg-text-primary px-6 text-body-md font-medium text-ink transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Enviando…" : "Enviar"}
            </button>
            {status && (
              <p
                role={status.type === "error" ? "alert" : "status"}
                className={
                  status.type === "success" ? successClass : errorClass
                }
              >
                {status.message}
              </p>
            )}
          </div>
        </form>

        <ul className="flex flex-col gap-2 font-mono text-label-md uppercase md:col-span-5 md:justify-center">
          {SOCIALS.filter((social) => social.href).map((social) => (
            <li key={social.label}>
              <a
                href={social.href}
                {...(social.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="inline-flex min-h-11 w-fit items-center text-text-muted transition-colors duration-200 hover:text-text-primary"
              >
                {social.label}
                {social.external && (
                  <span className="sr-only"> (abre em nova aba)</span>
                )}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
