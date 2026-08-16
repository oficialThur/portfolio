"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * Espelha exatamente as media queries do globals.css:
 * o modo espacial só existe em desktop E sem preferência por movimento reduzido.
 */
export const SPATIAL_QUERY =
  "(min-width: 768px) and (prefers-reduced-motion: no-preference)";

/**
 * Se o modo espacial está ativo neste cliente. SSR e primeiro render retornam
 * false (fluxo plano); o layout effect sincroniza antes do paint — sem flash.
 */
export function useSpatialEnabled(): boolean {
  const [enabled, setEnabled] = useState(false);

  useLayoutEffect(() => {
    const mql = window.matchMedia(SPATIAL_QUERY);
    const sync = () => setEnabled(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  return enabled;
}

/**
 * Mapeia o scroll vertical real para um progresso contínuo entre seções
 * (0 … count-1), suavizado por interpolação em requestAnimationFrame —
 * movimento físico e contínuo, nunca mecânico (DESIGN.md).
 *
 * Roda nos dois modos: no plano, o progresso alimenta apenas o indicador da
 * navegação; no espacial, ele dirige a pose de cada seção.
 */
export function useScrollProgress(count: number) {
  const [progress, setProgress] = useState(0);
  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const readTarget = useCallback(() => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const raw = max > 0 ? window.scrollY / max : 0;
    targetRef.current = Math.min(Math.max(raw, 0), 1) * (count - 1);
  }, [count]);

  useEffect(() => {
    const tick = () => {
      const delta = targetRef.current - currentRef.current;
      if (Math.abs(delta) < 0.0005) {
        currentRef.current = targetRef.current;
        setProgress(targetRef.current);
        rafRef.current = null;
        return;
      }
      currentRef.current += delta * 0.14;
      setProgress(currentRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };

    const onScrollOrResize = () => {
      readTarget();
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    // Sincroniza com a posição atual (ex.: scroll restaurado) sem animação:
    // o primeiro tick publica o valor já resolvido.
    readTarget();
    currentRef.current = targetRef.current;
    rafRef.current = requestAnimationFrame(tick);

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [count, readTarget]);

  /** Navegação direta: rola a trilha até a seção (âncoras do header e setas). */
  const goTo = useCallback(
    (index: number) => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const top = (index / (count - 1)) * max;
      window.scrollTo({
        top,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
    },
    [count],
  );

  return { progress, goTo };
}
