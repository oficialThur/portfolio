import { Link } from "react-router-dom";
import { useNoIndex } from "@/hooks/useNoIndex";

/**
 * Rota inexistente. Assume o lugar do canvas escuro do portfólio para que o
 * visitante nunca caia numa tela em branco; oferece o caminho de volta.
 */
export function NotFoundPage() {
  useNoIndex("404 — Página não encontrada");

  return (
    <main
      id="conteudo"
      tabIndex={-1}
      className="grid min-h-dvh place-items-center px-6 py-16"
    >
      <div className="w-full max-w-[560px]">
        <p className="font-mono text-label-md uppercase text-text-muted">404</p>

        <h1 className="mt-6 text-balance text-display-lg">
          Página não encontrada
        </h1>

        <p className="mt-6 max-w-[46ch] text-body-lg text-text-secondary">
          O endereço que você abriu não existe ou foi movido. Use o botão abaixo
          para voltar ao início.
        </p>

        <Link
          to="/"
          className="mt-10 inline-flex h-11 items-center justify-center rounded-sm border border-border px-6 font-mono text-label-md uppercase text-text-primary transition-colors duration-200 hover:border-text-primary"
        >
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
