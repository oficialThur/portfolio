import { useEffect } from "react";

/**
 * Aplica `noindex, nofollow` enquanto a página estiver montada e restaura o
 * título/robots anteriores ao sair — sem isso, voltar ao portfólio deixaria o
 * site inteiro marcado como noindex.
 */
export function useNoIndex(title) {
  useEffect(() => {
    const previousTitle = document.title;
    const existing = document.querySelector('meta[name="robots"]');
    const previousRobots = existing?.getAttribute("content") ?? null;
    const created = !existing;

    if (created) {
      const meta = document.createElement("meta");
      meta.name = "robots";
      meta.setAttribute("data-managed-by", "use-no-index");
      meta.content = "noindex, nofollow";
      document.head.appendChild(meta);
    } else {
      existing.setAttribute("content", "noindex, nofollow");
    }

    document.title = title;

    return () => {
      document.title = previousTitle;

      if (created) {
        document.head
          .querySelector('meta[name="robots"][data-managed-by="use-no-index"]')
          ?.remove();
        return;
      }

      if (previousRobots === null) {
        existing.removeAttribute("content");
      } else {
        existing.setAttribute("content", previousRobots);
      }
    };
  }, [title]);
}
