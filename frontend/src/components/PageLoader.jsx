import { useState } from "react";
import { site } from "@/data/site.js";

/**
 * Cortina de abertura: cobre a primeira pintura e desvanece via animação CSS
 * pura (some mesmo sem JavaScript). O React só remove o nó do DOM depois que
 * a transição termina — até lá, `visibility: hidden` + `aria-hidden` o tiram
 * de cena e da árvore de acessibilidade.
 */
export function PageLoader() {
  const [done, setDone] = useState(false);

  if (done) return null;

  return (
    <div
      className="page-loader"
      aria-hidden="true"
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) setDone(true);
      }}
    >
      <span className="font-mono text-label-md uppercase text-text-muted">
        {site.name}
      </span>
    </div>
  );
}
