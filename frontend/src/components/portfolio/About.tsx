import { site } from "@/src/data/site";

const METADATA = [site.role, site.education, site.location];

/**
 * Seção dominante — o hero é o Sobre. Tipografia grande lidera; metadata em
 * mono à direita; espaço negativo como elemento de composição (sketch).
 */
export function About() {
  return (
    <div className="pt-14 md:pt-0">
      <p className="enter font-mono text-label-md uppercase text-text-muted" style={{ ["--enter-delay" as string]: "0ms" }}>
        Sobre
      </p>

      <div className="mt-8 grid gap-10 md:mt-12 md:grid-cols-12 md:items-end md:gap-6">
        <div className="md:col-span-8">
          <h1
            className="enter text-balance text-display-xl"
            style={{ ["--enter-delay" as string]: "80ms" }}
          >
            Olá, sou o
            <br />
            {site.name}
          </h1>

          <p
            className="enter mt-8 max-w-[52ch] text-body-lg text-text-secondary"
            style={{ ["--enter-delay" as string]: "160ms" }}
          >
            Desenvolvedor fullstack e estudante de Ciência da Computação.
            Construo experiências digitais completas — do backend à interface —
            com tipografia, código e propósito.
          </p>
        </div>

        <div className="md:col-span-4">
          <ul
            className="enter flex flex-col gap-2 border-l border-border pl-4 font-mono text-label-md uppercase text-text-muted md:mb-2"
            style={{ ["--enter-delay" as string]: "240ms" }}
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
