import { contact } from "@/data/site.js";

const SOCIALS = [
  { label: "GitHub", href: contact.github, external: true },
  { label: "LinkedIn", href: contact.linkedin, external: true },
  {
    label: "Email",
    href: contact.email ? `mailto:${contact.email}` : "",
    external: false,
  },
];

const inputClass =
  "h-11 w-full rounded-sm border border-border bg-transparent px-3 text-body-md text-text-primary placeholder:text-text-muted";

const labelClass =
  "mb-2 block font-mono text-label-md uppercase text-text-muted";

/**
 * Endpoint minimalista: formulário à esquerda e, à direita, as redes como
 * texto puro (sem ícones) no mesmo estilo da stack dos projetos — mono,
 * maiúsculas, muted. Sem headline editorial (removido a pedido do dono,
 * 2026-08-16).
 *
 * A ação de envio fica propositalmente vazia: o dono vai escrever o backend.
 * Os campos já têm `name` e validação nativa prontos para plugar (ex.:
 * action="/api/contact" method="post" ou um fetch no onSubmit).
 */
export function Contact() {
  return (
    <div>
      <h2 className="font-mono text-label-md uppercase text-text-muted">
        Contato
      </h2>

      <div className="mt-8 grid gap-12 md:mt-12 md:grid-cols-12 md:gap-6">
        {/* TODO(owner): implementar a ação de envio (backend próprio). */}
        <form
          className="md:col-span-7"
          onSubmit={(event) => event.preventDefault()}
        >
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
                required
                className={inputClass}
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
                required
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="contato-mensagem" className={labelClass}>
                Mensagem
              </label>
              <textarea
                id="contato-mensagem"
                name="mensagem"
                required
                className={`${inputClass} h-auto min-h-[132px] resize-y py-3`}
              />
            </div>
            <button
              type="submit"
              className="h-11 w-fit cursor-pointer rounded-sm bg-text-primary px-6 text-body-md font-medium text-ink transition-opacity duration-200 hover:opacity-90"
            >
              Enviar
            </button>
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
                className="w-fit text-text-muted transition-colors duration-200 hover:text-text-primary"
              >
                {social.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
