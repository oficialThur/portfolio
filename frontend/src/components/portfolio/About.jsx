import { site } from "@/data/site.js";

const METADATA = [site.role, site.education, site.location];

/**
 * Seção dominante — o hero é o Sobre. Tipografia grande lidera; metadata em
 * mono à direita; espaço negativo como elemento de composição (sketch).
 * O parágrafo vem do cadastro de subtitle no admin (`GET /subtitulos`).
 */
export function About({ body = "" }) {
  return (
    <div className="pt-14 md:pt-0">
      <p
        className="enter font-mono text-label-md uppercase text-text-muted"
        style={{ "--enter-delay": "0ms" }}
      >
        Sobre
      </p>

      <div className="mt-8 grid gap-10 md:mt-12 md:grid-cols-12 md:items-end md:gap-6">
        <div className="md:col-span-8">
          <h1
            className="enter text-balance text-display-xl"
            style={{ "--enter-delay": "80ms" }}
          >
            Olá, sou o
            <br />
            {site.name}
          </h1>

          {body ? (
            <p
              className="enter mt-8 max-w-[52ch] text-body-lg text-text-secondary"
              style={{ "--enter-delay": "160ms" }}
            >
              {body}
            </p>
          ) : null}
        </div>

        <div className="md:col-span-4">
          <ul
            className="enter flex flex-col gap-2 border-l border-border pl-4 font-mono text-label-md uppercase text-text-muted md:mb-2"
            style={{ "--enter-delay": "240ms" }}
          >
            {METADATA.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
